export const AppFeatures = {
    VIEW_UPCOMING_EVENTS: 'view_upcoming_events',
    MANAGE_PUBLISHER_REQUESTS: 'manage_publisher_requests',
} as const;

export type AppFeatureKey = typeof AppFeatures[keyof typeof AppFeatures];

export type FeatureFlagsResponse = Record<AppFeatureKey, boolean>;