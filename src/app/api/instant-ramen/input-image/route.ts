import { NextResponse } from 'next/server';
import { createInstantRamenSupabaseServerClient } from '@/domains/instant-ramen/auth/server';
import {
  INSTANT_RAMEN_INPUT_IMAGE_MAX_BYTES,
  InstantRamenInputImageError,
  uploadInstantRamenInputImage,
} from '@/domains/instant-ramen/product/input-image';
import { getOrCreateInstantRamenShipAnyUser } from '@/domains/instant-ramen/server';

import { getStorageService } from '@/shared/services/storage';

const INPUT_IMAGE_MULTIPART_MAX_BYTES =
  INSTANT_RAMEN_INPUT_IMAGE_MAX_BYTES + 1024 * 1024;

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

function isUploadedFile(value: FormDataEntryValue): value is File {
  return typeof value !== 'string' && typeof value.arrayBuffer === 'function';
}

async function readRequestBodyWithinLimit(request: Request, maxBytes: number) {
  if (!request.body) {
    throw new InstantRamenInputImageError(
      'empty_input_image',
      'The selected image is empty.',
      400
    );
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new InstantRamenInputImageError(
          'input_image_too_large',
          'The selected image exceeds the 10 MB limit.',
          413
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body.buffer;
}

export async function POST(request: Request) {
  try {
    const supabase = await createInstantRamenSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse({
        code: 'unauthorized',
        message: 'Please sign in before uploading an input image.',
        status: 401,
      });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
      return errorResponse({
        code: 'invalid_form_data',
        message: 'Upload the image as multipart form data.',
        status: 415,
      });
    }

    const contentLengthHeader = request.headers.get('content-length');
    const contentLength = contentLengthHeader
      ? Number(contentLengthHeader)
      : null;
    if (
      contentLength !== null &&
      (!Number.isFinite(contentLength) ||
        contentLength < 0 ||
        contentLength > INPUT_IMAGE_MULTIPART_MAX_BYTES)
    ) {
      return errorResponse({
        code: 'input_image_too_large',
        message: 'The selected image exceeds the 10 MB limit.',
        status: 413,
      });
    }

    let formData: FormData;
    try {
      // Content-Length is not guaranteed on every runtime/protocol. Bound the
      // stream before multipart parsing so a chunked request cannot force the
      // Worker to buffer an arbitrarily large body.
      const requestBody = await readRequestBodyWithinLimit(
        request,
        INPUT_IMAGE_MULTIPART_MAX_BYTES
      );
      formData = await new Response(requestBody, {
        headers: { 'content-type': contentType },
      }).formData();
    } catch (error) {
      if (error instanceof InstantRamenInputImageError) {
        throw error;
      }
      return errorResponse({
        code: 'invalid_form_data',
        message: 'The image upload request is invalid.',
        status: 400,
      });
    }

    const entries = [...formData.getAll('file'), ...formData.getAll('files')];
    if (entries.length === 0) {
      return errorResponse({
        code: 'input_image_required',
        message: 'Select one image to upload.',
        status: 400,
      });
    }
    if (entries.length !== 1 || !isUploadedFile(entries[0])) {
      return errorResponse({
        code: 'multiple_input_images_not_supported',
        message: 'Upload exactly one image.',
        status: 400,
      });
    }

    const file = entries[0];
    if (file.size === 0) {
      return errorResponse({
        code: 'empty_input_image',
        message: 'The selected image is empty.',
        status: 400,
      });
    }
    if (file.size > INSTANT_RAMEN_INPUT_IMAGE_MAX_BYTES) {
      return errorResponse({
        code: 'input_image_too_large',
        message: 'The selected image exceeds the 10 MB limit.',
        status: 413,
      });
    }

    const bridge = await getOrCreateInstantRamenShipAnyUser({
      grantInitialCredits: true,
      supabaseUser: user,
    });
    const bytes = new Uint8Array(await file.arrayBuffer());
    const storage = await getStorageService();
    const uploaded = await uploadInstantRamenInputImage({
      bytes,
      claimedMimeType: file.type,
      storage,
      userId: bridge.user.id,
    });

    return NextResponse.json({
      success: true,
      data: uploaded,
    });
  } catch (error) {
    if (error instanceof InstantRamenInputImageError) {
      return errorResponse({
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }

    return errorResponse({
      code: 'input_image_upload_failed',
      message: 'The image could not be uploaded. Please try again.',
      status: 500,
    });
  }
}
