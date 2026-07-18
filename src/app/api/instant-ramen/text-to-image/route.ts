import { NextResponse } from 'next/server';
import {
  generateInstantRamenTextToImage,
  getInstantRamenGenerationModelProvider,
  InstantRamenTextToImageError,
  normalizeInstantRamenGenerationMode,
  queryInstantRamenTextToImageTask,
  validateInstantRamenGenerationRequest,
} from '@/domains/instant-ramen';
import { createInstantRamenSupabaseServerClient } from '@/domains/instant-ramen/auth/server';
import {
  InstantRamenInputImageError,
  resolveInstantRamenOwnedInputImage,
} from '@/domains/instant-ramen/product/input-image';
import { getOrCreateInstantRamenShipAnyUser } from '@/domains/instant-ramen/server';

import { AIMediaType, AITaskStatus } from '@/extensions/ai';
import {
  applyAITaskProviderPollResult,
  createAITask,
  failStalePendingAITask,
  findAITaskById,
  updateAITaskById,
  updatePendingAITaskWithProviderResult,
  type AITask,
  type NewAITask,
} from '@/shared/models/ai_task';
import { getRemainingCredits } from '@/shared/models/credit';

const GENERATION_REQUEST_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PROVIDER_SUBMISSION_STALE_MS = 2 * 60 * 1000;

function errorResponse({
  code,
  message,
  status,
}: {
  code: string;
  message: string;
  status: number;
}) {
  return NextResponse.json(
    {
      success: false,
      code,
      error: message,
    },
    { status }
  );
}

async function getAuthenticatedShipAnyUser() {
  const supabase = await createInstantRamenSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const bridge = await getOrCreateInstantRamenShipAnyUser({
    grantInitialCredits: true,
    supabaseUser: user,
  });

  return bridge.user;
}

function mapProviderStatus(status: 'pending' | 'succeeded' | 'failed') {
  if (status === 'succeeded') {
    return AITaskStatus.SUCCESS;
  }
  if (status === 'failed') {
    return AITaskStatus.FAILED;
  }
  return AITaskStatus.PROCESSING;
}

function readStoredImageUrl(taskResult?: string | null) {
  if (!taskResult) {
    return null;
  }

  try {
    const parsed = JSON.parse(taskResult);
    return typeof parsed?.imageUrl === 'string' ? parsed.imageUrl : null;
  } catch {
    return null;
  }
}

type GenerationTaskIdentity = {
  inputImageKey: string;
  mode: 'text-to-image' | 'image-to-image';
  model: string;
  prompt: string;
  size: string;
  userId: string;
};

function readStoredTaskOptions(options?: string | null) {
  if (!options) {
    return null;
  }

  try {
    const parsed = JSON.parse(options);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function taskMatchesIdentity(task: AITask, identity: GenerationTaskIdentity) {
  const options = readStoredTaskOptions(task.options);

  return (
    task.userId === identity.userId &&
    task.mediaType === AIMediaType.IMAGE &&
    task.provider === 'apimart' &&
    task.model === identity.model &&
    task.prompt === identity.prompt &&
    task.scene === identity.mode &&
    options?.product === 'instant-ramen' &&
    options?.mode === identity.mode &&
    options?.size === identity.size &&
    (typeof options?.inputImageKey === 'string'
      ? options.inputImageKey
      : '') === identity.inputImageKey
  );
}

function existingTaskResponse(task: AITask, identity: GenerationTaskIdentity) {
  if (!taskMatchesIdentity(task, identity)) {
    return errorResponse({
      code: 'idempotency_conflict',
      message: 'This generation request ID has already been used.',
      status: 409,
    });
  }

  if (task.status === AITaskStatus.FAILED) {
    return errorResponse({
      code: 'generation_failed',
      message: 'The previous attempt for this request failed. Please retry.',
      status: 409,
    });
  }

  const imageUrl = readStoredImageUrl(task.taskResult);
  const status =
    task.status === AITaskStatus.SUCCESS && imageUrl ? 'succeeded' : 'pending';
  const providerMapping = getInstantRamenGenerationModelProvider(task.model);

  return NextResponse.json({
    success: true,
    data: {
      creditCost: task.costCredits,
      imageUrl,
      mode: identity.mode,
      model: task.model,
      provider: task.provider,
      providerModelId: providerMapping?.providerModelId,
      status,
      taskId: task.id,
      mock: false,
    },
  });
}

export async function POST(request: Request) {
  let createdTask: Awaited<ReturnType<typeof createAITask>> | null = null;

  try {
    const user = await getAuthenticatedShipAnyUser();
    if (!user) {
      return errorResponse({
        code: 'unauthorized',
        message: 'Please sign in before generating an image.',
        status: 401,
      });
    }

    let parsedPayload: unknown;
    try {
      parsedPayload = await request.json();
    } catch {
      return errorResponse({
        code: 'invalid_request',
        message: 'The generation request is invalid.',
        status: 400,
      });
    }

    if (
      !parsedPayload ||
      typeof parsedPayload !== 'object' ||
      Array.isArray(parsedPayload)
    ) {
      return errorResponse({
        code: 'invalid_request',
        message: 'The generation request is invalid.',
        status: 400,
      });
    }

    const payload = parsedPayload as Record<string, unknown>;
    const requestId =
      typeof payload.requestId === 'string'
        ? payload.requestId.trim().toLowerCase()
        : '';
    if (!GENERATION_REQUEST_ID_PATTERN.test(requestId)) {
      return errorResponse({
        code: 'invalid_request_id',
        message: 'A valid generation request ID is required.',
        status: 400,
      });
    }

    const mode = normalizeInstantRamenGenerationMode(
      typeof payload.mode === 'string' ? payload.mode : undefined
    );
    const prompt = typeof payload.prompt === 'string' ? payload.prompt : '';
    const model = typeof payload.model === 'string' ? payload.model : '';
    const size = typeof payload.size === 'string' ? payload.size : undefined;
    const inputImageKey =
      typeof payload.inputImageKey === 'string'
        ? payload.inputImageKey.trim()
        : '';

    if (mode === 'text-to-image' && inputImageKey) {
      throw new InstantRamenTextToImageError(
        'input_image_not_allowed',
        'Input images are only accepted in Image to Image mode.',
        400
      );
    }

    if (mode === 'image-to-image' && !inputImageKey) {
      throw new InstantRamenTextToImageError(
        'input_image_required',
        'Upload a reference image before generating.',
        400
      );
    }

    const taskIdentity: GenerationTaskIdentity = {
      inputImageKey,
      mode,
      model,
      prompt: prompt.trim(),
      size: size?.trim() || '16:9',
      userId: user.id,
    };
    // Resolve idempotent retries before consulting mutable model pricing,
    // provider configuration, or storage state. An accepted request keeps the
    // contract and charge that were recorded when it was first created.
    const existingTask = await findAITaskById(requestId);
    if (existingTask) {
      return existingTaskResponse(existingTask, taskIdentity);
    }

    const inputImageUrl =
      mode === 'image-to-image'
        ? await resolveInstantRamenOwnedInputImage({
            key: inputImageKey,
            userId: user.id,
          })
        : undefined;

    const validated = validateInstantRamenGenerationRequest({
      inputImageUrl,
      mode,
      model,
      prompt,
      shipAnyUserId: user.id,
      size,
    });

    const remainingCredits = await getRemainingCredits(user.id);
    if (remainingCredits < validated.creditCost) {
      throw new InstantRamenTextToImageError(
        'insufficient_credits',
        `You need ${validated.creditCost} credits to generate with ${validated.catalogModel.displayName}.`,
        402
      );
    }

    const newTask: NewAITask = {
      id: requestId,
      userId: user.id,
      mediaType: AIMediaType.IMAGE,
      provider: validated.providerMapping.provider,
      model: validated.catalogModel.slug,
      prompt: validated.prompt,
      options: JSON.stringify({
        inputImageKey: inputImageKey || undefined,
        mode: validated.mode,
        product: 'instant-ramen',
        size: validated.size,
      }),
      status: AITaskStatus.PENDING,
      costCredits: validated.creditCost,
      scene: validated.mode,
    };
    try {
      createdTask = await createAITask(newTask);
    } catch (error) {
      // Concurrent retries race on the task primary key. The losing request
      // returns the owned task instead of consuming credits a second time.
      const racedTask = await findAITaskById(requestId);
      if (racedTask) {
        return existingTaskResponse(racedTask, taskIdentity);
      }
      throw error;
    }

    let providerResult;
    try {
      providerResult = await generateInstantRamenTextToImage({
        inputImageUrl: validated.inputImageUrl,
        mode: validated.mode,
        model: validated.catalogModel.slug,
        prompt: validated.prompt,
        shipAnyUserId: user.id,
        size: validated.size,
      });
    } catch (error) {
      await updateAITaskById(createdTask.id, {
        status: AITaskStatus.FAILED,
        creditId: createdTask.creditId,
        taskInfo: JSON.stringify({ status: 'failed' }),
      });
      throw error;
    }

    const storedStatus =
      providerResult.status === 'succeeded'
        ? AITaskStatus.SUCCESS
        : AITaskStatus.PROCESSING;
    const providerTaskUpdate = {
      status: storedStatus,
      taskId: providerResult.taskId,
      taskInfo: JSON.stringify({ status: providerResult.status }),
      taskResult: providerResult.imageUrl
        ? JSON.stringify({ imageUrl: providerResult.imageUrl })
        : null,
    };
    let persistedTask: AITask | null = null;
    try {
      persistedTask = await updatePendingAITaskWithProviderResult(
        createdTask.id,
        providerTaskUpdate
      );
    } catch {
      try {
        // APIMart already accepted the work. Retry the conditional write, but
        // never overwrite a task that the stale-submission path claimed.
        persistedTask = await updatePendingAITaskWithProviderResult(
          createdTask.id,
          {
            ...providerTaskUpdate,
            taskInfo: JSON.stringify({
              reason: 'task_persistence_recovered',
              status: providerResult.status,
            }),
          }
        );
      } catch {
        // The read below distinguishes an already-committed first write from
        // an unresolved persistence failure without exposing DB details.
      }
    }

    if (!persistedTask) {
      const latestTask = await findAITaskById(createdTask.id);
      const alreadyPersisted =
        latestTask?.status === storedStatus &&
        (latestTask.taskId ?? undefined) === providerResult.taskId &&
        (!providerResult.imageUrl ||
          readStoredImageUrl(latestTask.taskResult) ===
            providerResult.imageUrl);
      if (!alreadyPersisted) {
        throw new Error('Provider task persistence was not claimed.');
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...providerResult,
        creditCost: validated.creditCost,
        taskId: createdTask.id,
      },
    });
  } catch (error) {
    if (error instanceof InstantRamenTextToImageError) {
      return errorResponse({
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }

    if (error instanceof InstantRamenInputImageError) {
      return errorResponse({
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }

    if (error instanceof Error && /insufficient credits/i.test(error.message)) {
      return errorResponse({
        code: 'insufficient_credits',
        message: 'You do not have enough credits for this generation.',
        status: 402,
      });
    }

    return errorResponse({
      code: createdTask ? 'generation_failed' : 'task_creation_failed',
      message: createdTask
        ? 'Image generation failed. Please try again.'
        : 'The generation task could not be created. Please try again.',
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedShipAnyUser();
    if (!user) {
      return errorResponse({
        code: 'unauthorized',
        message: 'Please sign in before checking image generation status.',
        status: 401,
      });
    }

    const url = new URL(request.url);
    const internalTaskId = url.searchParams.get('taskId')?.trim() ?? '';
    if (!internalTaskId) {
      throw new InstantRamenTextToImageError(
        'invalid_task',
        'Task ID is required.',
        400
      );
    }

    let task = await findAITaskById(internalTaskId);
    if (!task || task.mediaType !== AIMediaType.IMAGE) {
      throw new InstantRamenTextToImageError(
        'task_not_found',
        'Image generation task not found.',
        404
      );
    }

    if (task.userId !== user.id) {
      throw new InstantRamenTextToImageError(
        'forbidden',
        'You do not have access to this generation task.',
        403
      );
    }

    const taskMode =
      task.scene === 'text-to-image' || task.scene === 'image-to-image'
        ? task.scene
        : null;
    const taskOptions = readStoredTaskOptions(task.options);
    if (
      !taskMode ||
      task.provider !== 'apimart' ||
      taskOptions?.product !== 'instant-ramen' ||
      taskOptions?.mode !== taskMode
    ) {
      throw new InstantRamenTextToImageError(
        'task_not_found',
        'Image generation task not found.',
        404
      );
    }

    if (task.status === AITaskStatus.FAILED) {
      return NextResponse.json({
        success: true,
        data: {
          imageUrl: null,
          status: 'failed',
          taskId: task.id,
        },
      });
    }

    if (task.status === AITaskStatus.SUCCESS) {
      return NextResponse.json({
        success: true,
        data: {
          imageUrl: readStoredImageUrl(task.taskResult),
          status: 'succeeded',
          taskId: task.id,
        },
      });
    }

    if (!task.taskId) {
      const updatedAt = new Date(task.updatedAt).getTime();
      if (
        Number.isFinite(updatedAt) &&
        Date.now() - updatedAt >= PROVIDER_SUBMISSION_STALE_MS
      ) {
        const failedTask = await failStalePendingAITask({
          id: task.id,
          staleBefore: new Date(Date.now() - PROVIDER_SUBMISSION_STALE_MS),
          taskInfo: JSON.stringify({ reason: 'provider_submission_stale' }),
        });

        if (failedTask) {
          return NextResponse.json({
            success: true,
            data: {
              imageUrl: null,
              status: 'failed',
              taskId: task.id,
            },
          });
        }

        // The provider-result write may have won the same row race. Re-read
        // after the conditional stale claim instead of using the stale copy.
        const refreshedTask = await findAITaskById(task.id);
        if (!refreshedTask || refreshedTask.userId !== user.id) {
          throw new InstantRamenTextToImageError(
            'task_not_found',
            'Image generation task not found.',
            404
          );
        }
        task = refreshedTask;

        if (task.status === AITaskStatus.FAILED) {
          return NextResponse.json({
            success: true,
            data: {
              imageUrl: null,
              status: 'failed',
              taskId: task.id,
            },
          });
        }
        if (task.status === AITaskStatus.SUCCESS) {
          return NextResponse.json({
            success: true,
            data: {
              imageUrl: readStoredImageUrl(task.taskResult),
              status: 'succeeded',
              taskId: task.id,
            },
          });
        }
      }

      if (!task.taskId) {
        return NextResponse.json({
          success: true,
          data: {
            imageUrl: null,
            status: 'pending',
            taskId: task.id,
          },
        });
      }
    }

    const providerResult = await queryInstantRamenTextToImageTask({
      taskId: task.taskId,
    });
    const storedStatus = mapProviderStatus(providerResult.status);
    const persistedTask = await applyAITaskProviderPollResult({
      id: task.id,
      status: storedStatus,
      taskInfo: JSON.stringify({ status: providerResult.status }),
      taskResult: providerResult.imageUrl
        ? JSON.stringify({ imageUrl: providerResult.imageUrl })
        : undefined,
    });

    if (!persistedTask) {
      throw new InstantRamenTextToImageError(
        'task_not_found',
        'Image generation task not found.',
        404
      );
    }

    const finalStatus =
      persistedTask.status === AITaskStatus.SUCCESS
        ? 'succeeded'
        : persistedTask.status === AITaskStatus.FAILED ||
            persistedTask.status === AITaskStatus.CANCELED
          ? 'failed'
          : 'pending';

    return NextResponse.json({
      success: true,
      data: {
        imageUrl:
          finalStatus === 'succeeded'
            ? readStoredImageUrl(persistedTask.taskResult)
            : null,
        status: finalStatus,
        taskId: task.id,
      },
    });
  } catch (error) {
    if (error instanceof InstantRamenTextToImageError) {
      return errorResponse({
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }

    return errorResponse({
      code: 'task_status_failed',
      message: 'Failed to check image generation status.',
      status: 500,
    });
  }
}
