export const AppFeatures = {} as const;

export type AppFeatureKey = typeof AppFeatures[keyof typeof AppFeatures];

export type FeatureFlagsResponse = Record<AppFeatureKey, boolean>;