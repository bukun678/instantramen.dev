import { NextResponse } from 'next/server';

import {
  generateInstantRamenTextToImage,
  InstantRamenTextToImageError,
} from '@/domains/instant-ramen';
import { createInstantRamenSupabaseServerClient } from '@/domains/instant-ramen/auth/server';
import { getOrCreateInstantRamenShipAnyUser } from '@/domains/instant-ramen/server';

export async function POST(request: Request) {
  try {
    const supabase = await createInstantRamenSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          code: 'unauthorized',
          error: 'Please sign in before generating an image.',
        },
        { status: 401 }
      );
    }

    const bridge = await getOrCreateInstantRamenShipAnyUser({
      grantInitialCredits: false,
      supabaseUser: user,
    });

    const { prompt, model } = await request.json();

    const result = await generateInstantRamenTextToImage({
      prompt: String(prompt ?? ''),
      model: String(model ?? ''),
      shipAnyUserId: bridge.user.id,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof InstantRamenTextToImageError) {
      return NextResponse.json(
        {
          success: false,
          code: error.code,
          error: error.message,
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        code: 'generation_failed',
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate image.',
      },
      { status: 400 }
    );
  }
}
