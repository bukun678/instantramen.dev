import {
  generationEnabledInstantRamenModels,
  getDefaultInstantRamenGenerationModel,
  getInstantRamenGeneratorEntryModels,
} from '../content/models';

export type InstantRamenTextToImageMvpModel = {
  slug: string;
  label: string;
  provider: string;
  modelId: string;
  description: string;
};

export const instantRamenTextToImageMvpModels: InstantRamenTextToImageMvpModel[] =
  generationEnabledInstantRamenModels.map((model) => ({
    slug: model.slug,
    label: model.displayName,
    provider: model.provider,
    modelId: model.providerModelId,
    description: model.shortDescription,
  }));

export const instantRamenGeneratorEntryModels =
  getInstantRamenGeneratorEntryModels();

export function resolveInstantRamenGeneratorModel(slug?: string | null) {
  const requestedModel = slug
    ? generationEnabledInstantRamenModels.find((model) => model.slug === slug)
    : undefined;

  return (requestedModel ?? getDefaultInstantRamenGenerationModel()).slug;
}

export function getInstantRamenTextToImageMvpModel(slug: string) {
  return instantRamenTextToImageMvpModels.find((model) => model.slug === slug);
}
