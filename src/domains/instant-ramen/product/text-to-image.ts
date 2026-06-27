import {
  generationEnabledInstantRamenModels,
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

export const instantRamenGeneratorEntryModels = getInstantRamenGeneratorEntryModels();

export function getInstantRamenTextToImageMvpModel(slug: string) {
  return instantRamenTextToImageMvpModels.find((model) => model.slug === slug);
}
