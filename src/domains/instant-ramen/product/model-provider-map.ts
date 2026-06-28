import {
  getInstantRamenModelBySlug,
  type InstantRamenModelConfig,
} from '../content';

export type InstantRamenGenerationProviderStatus = 'not-configured';

export type InstantRamenGenerationExecutionStatus =
  | 'provider_not_configured';

export type InstantRamenGenerationModelProvider = {
  slug: string;
  displayName: string;
  provider: string;
  providerModelId: string;
  providerStatus: InstantRamenGenerationProviderStatus;
  executionStatus: InstantRamenGenerationExecutionStatus;
  allowGeneration: boolean;
  creditCost: number;
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
    providerStatus: 'not-configured',
    executionStatus: 'provider_not_configured',
    allowGeneration:
      model.enabled &&
      model.visible &&
      model.availability === 'available' &&
      model.allowGeneration,
    creditCost: model.creditCost,
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
