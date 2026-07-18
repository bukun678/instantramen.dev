import {
  getInstantRamenModelBySlug,
  type InstantRamenModelConfig,
  type InstantRamenSupportedMode,
} from '../content';

export type InstantRamenGenerationProviderStatus = 'configured';

export type InstantRamenGenerationExecutionStatus = 'ready';

export type InstantRamenGenerationModelProvider = {
  slug: string;
  displayName: string;
  provider: string;
  providerModelId: string;
  providerStatus: InstantRamenGenerationProviderStatus;
  executionStatus: InstantRamenGenerationExecutionStatus;
  apiKeyEnvName: 'APIMART_API_KEY';
  allowGeneration: boolean;
  creditCost: number;
  modeCreditCosts: Partial<Record<InstantRamenSupportedMode, number>>;
  supportedModes: InstantRamenSupportedMode[];
  imageInput?: InstantRamenModelConfig['imageInput'];
};

const MVP_GENERATION_MODEL_SLUGS = ['gpt-image-2', 'nano-banana'] as const;

function isInstantRamenModelConfig(
  model: InstantRamenModelConfig | undefined
): model is InstantRamenModelConfig {
  return Boolean(model);
}

function buildGenerationModelProvider(
  model: InstantRamenModelConfig
): InstantRamenGenerationModelProvider {
  return {
    slug: model.slug,
    displayName: model.displayName,
    provider: model.provider,
    providerModelId: model.providerModelId,
    providerStatus: 'configured',
    executionStatus: 'ready',
    apiKeyEnvName: 'APIMART_API_KEY',
    allowGeneration:
      model.enabled &&
      model.visible &&
      model.availability === 'available' &&
      model.allowGeneration,
    creditCost: model.creditCost,
    modeCreditCosts: model.modeCreditCosts,
    supportedModes: model.supportedModes,
    imageInput: model.imageInput,
  };
}

export const instantRamenGenerationModelProviders =
  MVP_GENERATION_MODEL_SLUGS.map((slug) => getInstantRamenModelBySlug(slug))
    .filter(isInstantRamenModelConfig)
    .map((model) => buildGenerationModelProvider(model));

export function getInstantRamenGenerationModelProvider(slug: string) {
  return instantRamenGenerationModelProviders.find(
    (provider) => provider.slug === slug
  );
}
