/**
 * Weight presets for pillar scoring
 */

import { Weights } from "./types";

export const PRESETS: Record<string, Weights> = {
  equal: {
    politics: 0.25,
    media: 0.25,
    business: 0.25,
    technology: 0.25,
  },
  politicsHeavy: {
    politics: 0.4,
    media: 0.25,
    business: 0.2,
    technology: 0.15,
  },
  mediaHeavy: {
    politics: 0.2,
    media: 0.4,
    business: 0.2,
    technology: 0.2,
  },
  businessHeavy: {
    politics: 0.25,
    media: 0.2,
    business: 0.4,
    technology: 0.15,
  },
  technologyHeavy: {
    politics: 0.2,
    media: 0.25,
    business: 0.15,
    technology: 0.4,
  },
};

export function getPreset(name: string): Weights {
  const preset = PRESETS[name];
  if (!preset) {
    throw new Error(`Unknown preset: ${name}. Available presets: ${Object.keys(PRESETS).join(", ")}`);
  }
  return preset;
}

export function validateWeights(weights: Weights): boolean {
  const sum = weights.politics + weights.media + weights.business + weights.technology;
  return Math.abs(sum - 1.0) < 0.01; // allow small floating point errors
}

export function normalizeWeights(weights: Weights): Weights {
  const sum = weights.politics + weights.media + weights.business + weights.technology;
  return {
    politics: weights.politics / sum,
    media: weights.media / sum,
    business: weights.business / sum,
    technology: weights.technology / sum,
  };
}

