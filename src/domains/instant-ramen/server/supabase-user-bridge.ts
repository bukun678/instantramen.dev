import type { User as SupabaseUser } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';

import { db } from '@/core/db';
import { user } from '@/config/db/schema';
import { getUuid } from '@/shared/lib/hash';
import { grantCreditsForNewUser } from '@/shared/models/credit';
import type { User } from '@/shared/models/user';

export type InstantRamenShipAnyUserBridgeResult = {
  user: User;
  created: boolean;
};

function normalizeEmail(email?: string | null) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function getDisplayName(supabaseUser: SupabaseUser, email: string) {
  const metadata = supabaseUser.user_metadata || {};
  const metadataName =
    typeof metadata.full_name === 'string'
      ? metadata.full_name
      : typeof metadata.name === 'string'
        ? metadata.name
        : '';

  return metadataName.trim() || email.split('@')[0] || 'Instant Ramen User';
}

export async function getOrCreateInstantRamenShipAnyUser({
  grantInitialCredits = false,
  supabaseUser,
}: {
  grantInitialCredits?: boolean;
  supabaseUser: SupabaseUser;
}): Promise<InstantRamenShipAnyUserBridgeResult> {
  const email = normalizeEmail(supabaseUser.email);

  if (!email) {
    throw new Error('Supabase user email is required.');
  }

  const [existingUser] = await db()
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existingUser) {
    return {
      user: existingUser,
      created: false,
    };
  }

  const metadata = supabaseUser.user_metadata || {};
  const avatarUrl =
    typeof metadata.avatar_url === 'string' ? metadata.avatar_url : null;

  let createdUser: User;
  try {
    createdUser = await db().transaction(async (tx: any) => {
      const [insertedUser] = await tx
        .insert(user)
        .values({
          id: getUuid(),
          name: getDisplayName(supabaseUser, email),
          email,
          emailVerified: Boolean(supabaseUser.email_confirmed_at),
          image: avatarUrl,
          locale: '',
          ip: '',
          utmSource: 'instant-ramen-supabase',
        })
        .returning();

      if (grantInitialCredits) {
        await grantCreditsForNewUser(insertedUser, tx);
      }

      return insertedUser;
    });
  } catch (error) {
    // Concurrent first requests can race on the unique email. If another
    // transaction completed the same bridge, return its fully-created user.
    const [racedUser] = await db()
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    if (racedUser) {
      return {
        user: racedUser,
        created: false,
      };
    }
    throw error;
  }

  return {
    user: createdUser,
    created: true,
  };
}
