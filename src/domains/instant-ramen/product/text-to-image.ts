export type InstantRamenTextToImageMvpModel = {
  slug: 'gpt-image-2' | 'nano-banana';
  label: 'GPT Image 2' | 'Nano Banana';
  provider: 'openai' | 'nano-banana';
  modelId: string;
  description: string;
};

export const instantRamenTextToImageMvpModels: InstantRamenTextToImageMvpModel[] =
  [
    {
      slug: 'gpt-image-2',
      label: 'GPT Image 2',
      provider: 'openai',
      modelId: 'gpt-image-2',
      description: 'Best for detailed prompts and polished image concepts.',
    },
    {
      slug: 'nano-banana',
      label: 'Nano Banana',
      provider: 'nano-banana',
      modelId: 'nano-banana-image',
      description: 'Best for fast creative exploration and prompt iteration.',
    },
  ];

export function getInstantRamenTextToImageMvpModel(slug: string) {
  return instantRamenTextToImageMvpModels.find((model) => model.slug === slug);
}
