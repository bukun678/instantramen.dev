import { and, count, desc, eq, isNull, lte, sql } from 'drizzle-orm';

import { db } from '@/core/db';
import { aiTask, credit } from '@/config/db/schema';
import { AITaskStatus } from '@/extensions/ai';
import { appendUserToResult, User } from '@/shared/models/user';

import { consumeCredits, CreditStatus } from './credit';

export type AITask = typeof aiTask.$inferSelect & {
  user?: User;
};
export type NewAITask = typeof aiTask.$inferInsert;
export type UpdateAITask = Partial<Omit<NewAITask, 'id' | 'createdAt'>>;

export async function createAITask(newAITask: NewAITask) {
  const result = await db().transaction(async (tx: any) => {
    // 1. create task record
    const [taskResult] = await tx.insert(aiTask).values(newAITask).returning();

    if (newAITask.costCredits && newAITask.costCredits > 0) {
      // 2. consume credits
      const consumedCredit = await consumeCredits({
        userId: newAITask.userId,
        credits: newAITask.costCredits,
        scene: newAITask.scene,
        description: `generate ${newAITask.mediaType}`,
        metadata: JSON.stringify({
          type: 'ai-task',
          mediaType: taskResult.mediaType,
          taskId: taskResult.id,
        }),
        tx,
      });

      // 3. update task record with consumed credit id
      if (consumedCredit && consumedCredit.id) {
        taskResult.creditId = consumedCredit.id;
        await tx
          .update(aiTask)
          .set({ creditId: consumedCredit.id })
          .where(eq(aiTask.id, taskResult.id));
      }
    }

    return taskResult;
  });

  return result;
}

export async function findAITaskById(id: string) {
  const [result] = await db().select().from(aiTask).where(eq(aiTask.id, id));
  return result;
}

async function restoreConsumedCredits(tx: any, creditId: string) {
  const [consumedCredit] = await tx
    .select()
    .from(credit)
    .where(and(eq(credit.id, creditId), eq(credit.status, CreditStatus.ACTIVE)))
    .for('update');

  if (!consumedCredit || consumedCredit.status !== CreditStatus.ACTIVE) {
    return;
  }

  const consumedItems = JSON.parse(consumedCredit.consumedDetail || '[]');
  await Promise.all(
    consumedItems.map((item: any) => {
      if (item && item.creditId && item.creditsConsumed > 0) {
        return tx
          .update(credit)
          .set({
            remainingCredits: sql`${credit.remainingCredits} + ${item.creditsConsumed}`,
          })
          .where(eq(credit.id, item.creditId));
      }
    })
  );

  await tx
    .update(credit)
    .set({
      status: CreditStatus.DELETED,
    })
    .where(
      and(eq(credit.id, creditId), eq(credit.status, CreditStatus.ACTIVE))
    );
}

export async function updatePendingAITaskWithProviderResult(
  id: string,
  updateAITask: UpdateAITask
) {
  const [result] = await db()
    .update(aiTask)
    .set(updateAITask)
    .where(
      and(
        eq(aiTask.id, id),
        eq(aiTask.status, AITaskStatus.PENDING),
        isNull(aiTask.taskId)
      )
    )
    .returning();

  return result ?? null;
}

export async function failStalePendingAITask({
  id,
  staleBefore,
  taskInfo,
}: {
  id: string;
  staleBefore: Date;
  taskInfo: string;
}) {
  return db().transaction(async (tx: any) => {
    const staleCondition = and(
      eq(aiTask.id, id),
      eq(aiTask.status, AITaskStatus.PENDING),
      isNull(aiTask.taskId),
      lte(aiTask.updatedAt, staleBefore)
    );
    const [staleTask] = await tx
      .select()
      .from(aiTask)
      .where(staleCondition)
      .for('update');

    if (!staleTask) {
      return null;
    }

    if (staleTask.creditId) {
      await restoreConsumedCredits(tx, staleTask.creditId);
    }

    const [failedTask] = await tx
      .update(aiTask)
      .set({
        status: AITaskStatus.FAILED,
        taskInfo,
      })
      .where(staleCondition)
      .returning();

    return failedTask ?? null;
  });
}

export async function applyAITaskProviderPollResult({
  id,
  status,
  taskInfo,
  taskResult,
}: {
  id: string;
  status: AITaskStatus;
  taskInfo: string;
  taskResult?: string | null;
}) {
  return db().transaction(async (tx: any) => {
    const [lockedTask] = await tx
      .select()
      .from(aiTask)
      .where(eq(aiTask.id, id))
      .for('update');

    if (!lockedTask) {
      return null;
    }

    if (
      lockedTask.status === AITaskStatus.SUCCESS ||
      lockedTask.status === AITaskStatus.FAILED ||
      lockedTask.status === AITaskStatus.CANCELED
    ) {
      return lockedTask;
    }

    if (status === AITaskStatus.FAILED && lockedTask.creditId) {
      await restoreConsumedCredits(tx, lockedTask.creditId);
    }

    const [updatedTask] = await tx
      .update(aiTask)
      .set({
        status,
        taskInfo,
        taskResult: taskResult ?? lockedTask.taskResult,
      })
      .where(eq(aiTask.id, id))
      .returning();

    return updatedTask ?? null;
  });
}

export async function updateAITaskById(id: string, updateAITask: UpdateAITask) {
  const result = await db().transaction(async (tx: any) => {
    // task failed, Revoke credit consumption record
    if (updateAITask.status === AITaskStatus.FAILED && updateAITask.creditId) {
      await restoreConsumedCredits(tx, updateAITask.creditId);
    }

    // update task
    const [result] = await tx
      .update(aiTask)
      .set(updateAITask)
      .where(eq(aiTask.id, id))
      .returning();

    return result;
  });

  return result;
}

export async function getAITasksCount({
  userId,
  status,
  mediaType,
  provider,
}: {
  userId?: string;
  status?: string;
  mediaType?: string;
  provider?: string;
}): Promise<number> {
  const [result] = await db()
    .select({ count: count() })
    .from(aiTask)
    .where(
      and(
        userId ? eq(aiTask.userId, userId) : undefined,
        mediaType ? eq(aiTask.mediaType, mediaType) : undefined,
        provider ? eq(aiTask.provider, provider) : undefined,
        status ? eq(aiTask.status, status) : undefined
      )
    );

  return result?.count || 0;
}

export async function getAITasks({
  userId,
  status,
  mediaType,
  provider,
  page = 1,
  limit = 30,
  getUser = false,
}: {
  userId?: string;
  status?: string;
  mediaType?: string;
  provider?: string;
  page?: number;
  limit?: number;
  getUser?: boolean;
}): Promise<AITask[]> {
  const result = await db()
    .select()
    .from(aiTask)
    .where(
      and(
        userId ? eq(aiTask.userId, userId) : undefined,
        mediaType ? eq(aiTask.mediaType, mediaType) : undefined,
        provider ? eq(aiTask.provider, provider) : undefined,
        status ? eq(aiTask.status, status) : undefined
      )
    )
    .orderBy(desc(aiTask.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  if (getUser) {
    return appendUserToResult(result);
  }

  return result;
}
