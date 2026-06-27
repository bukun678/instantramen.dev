import { instantRamenBrandConfig } from '../config/brand';
import { getInstantRamenTextToImageMvpModel } from './text-to-image';

export type InstantRamenTextToImageRequest = {
  prompt: string;
  model: string;
};

export type InstantRamenTextToImageResult = {
  imageUrl: string;
  model: string;
  provider: string;
  mock: boolean;
};

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createMockImageDataUrl({
  prompt,
  modelLabel,
}: {
  prompt: string;
  modelLabel: string;
}) {
  const safePrompt = escapeSvgText(prompt.slice(0, 120));
  const safeModel = escapeSvgText(modelLabel);
  const safeProduct = escapeSvgText(instantRamenBrandConfig.productName);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="48%" stop-color="#fb7185"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="55%">
      <stop offset="0%" stop-color="#fff7ed" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#fff7ed" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <rect width="1024" height="1024" fill="url(#glow)"/>
  <circle cx="784" cy="214" r="126" fill="#fef3c7" opacity="0.35"/>
  <circle cx="245" cy="790" r="180" fill="#111827" opacity="0.22"/>
  <rect x="96" y="108" width="832" height="808" rx="56" fill="#0b0b0a" opacity="0.72"/>
  <text x="512" y="250" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="700" fill="#fff7ed">${safeProduct}</text>
  <text x="512" y="320" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="26" fill="#fde68a">${safeModel} mock preview</text>
  <foreignObject x="170" y="410" width="684" height="260">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, Arial, sans-serif; color: #fff7ed; font-size: 34px; line-height: 1.35; text-align: center; font-weight: 700;">
      ${safePrompt || 'Your generated image preview will appear here.'}
    </div>
  </foreignObject>
  <text x="512" y="830" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" fill="#fed7aa">Mock fallback · provider keys not configured</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function generateInstantRamenTextToImage({
  prompt,
  model,
}: InstantRamenTextToImageRequest): Promise<InstantRamenTextToImageResult> {
  const trimmedPrompt = prompt.trim();
  const selectedModel = getInstantRamenTextToImageMvpModel(model);

  if (!trimmedPrompt) {
    throw new Error('Prompt is required.');
  }

  if (!selectedModel) {
    throw new Error('Invalid model.');
  }

  // Real providers will be added here behind this adapter.
  // Until provider keys are configured, the MVP uses a mock fallback so users
  // can complete the full prompt → model → generate → result loop.
  return {
    imageUrl: createMockImageDataUrl({
      prompt: trimmedPrompt,
      modelLabel: selectedModel.label,
    }),
    model: selectedModel.slug,
    provider: selectedModel.provider,
    mock: true,
  };
}
