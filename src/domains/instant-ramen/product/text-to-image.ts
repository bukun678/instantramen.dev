import {
  generationEnabledInstantRamenModels,
  getDefaultInstantRamenGenerationModel,
  getInstantRamenGeneratorEntryModels,
} from '../content/models';
import type { InstantRamenSupportedMode } from '../content/types';

export type InstantRamenGenerationMode = Extract<
  InstantRamenSupportedMode,
  'text-to-image' | 'image-to-image'
>;

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

export function getInstantRamenGenerationModelsForMode(
  mode: InstantRamenGenerationMode
) {
  return generationEnabledInstantRamenModels.filter(
    (model) =>
      model.supportedModes.includes(mode) &&
      (mode !== 'image-to-image' || model.capabilities.supportsImageInput)
  );
}

export function resolveInstantRamenGeneratorModel(
  slug?: string | null,
  mode: InstantRamenGenerationMode = 'text-to-image'
) {
  const availableModels = getInstantRamenGenerationModelsForMode(mode);
  const requestedModel = slug
    ? availableModels.find((model) => model.slug === slug)
    : undefined;

  return (
    requestedModel ??
    availableModels.find((model) => model.defaultSelected) ??
    availableModels[0] ??
    getDefaultInstantRamenGenerationModel()
  ).slug;
}

export function getInstantRamenTextToImageMvpModel(slug: string) {
  return instantRamenTextToImageMvpModels.find((model) => model.slug === slug);
}
