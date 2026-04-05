export const AppFeatures = {
    VIEW_UPCOMING_EVENTS: 'view_upcoming_events',
    VIEW_FEATURED_EVENTS: 'view_featured_events',
} as const;

export type AppFeatureKey = typeof AppFeatures[keyof typeof AppFeatures];

export type FeatureFlagsResponse = Record<AppFeatureKey, boolean>;