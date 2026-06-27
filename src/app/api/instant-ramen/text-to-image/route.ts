import { NextResponse } from 'next/server';

import { generateInstantRamenTextToImage } from '@/domains/instant-ramen';

export async function POST(request: Request) {
  try {
    const { prompt, model } = await request.json();

    const result = await generateInstantRamenTextToImage({
      prompt: String(prompt ?? ''),
      model: String(model ?? ''),
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate image with mock fallback.',
      },
      { status: 400 }
    );
  }
}
