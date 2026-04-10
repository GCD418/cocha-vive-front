import { Routes } from '@angular/router';
import { EventList } from './pages/event-list/event-list';
import { HomeComponent } from './pages/home/home';
import { EventCreate } from './pages/event-create/event-create';
import { EventDetails } from './pages/event-details/event-details';
import { CategoryEventsComponent } from './pages/category-events/category-events';
import { ForbiddenPageComponent } from './pages/forbidden/forbidden';
import { authGuard } from './core/guards/auth-guard';
import { ExploreEvent } from './pages/explore-event/explore-event';
import { OnboardingComponent } from './pages/onboarding/onboarding-component';
import { requireFeature } from './core/guards/require-feature';
import { AppFeatures } from './models/app-features';
import { PublisherRequestsPageComponent } from './pages/publisher-requests/publisher-requests';
import { PublisherRequestDetailsPageComponent } from './pages/publisher-request-details/publisher-request-details';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'events', component: EventList, canActivate: [authGuard], data: { roles: ['ROLE_PUBLISHER'] } },
    {
        path: 'events/create',
        component: EventCreate,
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_PUBLISHER'] },
    },
    { path: 'event-details/:id', component: EventDetails },
    {
        path: 'admin/publisher-requests',
        component: PublisherRequestsPageComponent,
        canActivate: [authGuard, requireFeature(AppFeatures.MANAGE_PUBLISHER_REQUESTS)],
        data: { roles: ['ROLE_ADMIN'] },
    },
    {
        path: 'admin/publisher-requests/:id',
        component: PublisherRequestDetailsPageComponent,
        canActivate: [authGuard, requireFeature(AppFeatures.MANAGE_PUBLISHER_REQUESTS)],
        data: { roles: ['ROLE_ADMIN'] },
    },
    { path: 'category-events/:name', component: CategoryEventsComponent },
    { path: 'forbidden', component: ForbiddenPageComponent },
    { path: 'explore-events', component: ExploreEvent },
    { path: 'onboarding', component: OnboardingComponent, canActivate: [authGuard] },
    // Example of a route protected by a feature flag. If anyone uses something different 10 Bs.
    // {path: 'make-payment', component: NonExistentComponent, canActivate: [requireFeature(AppFeatures.VIEW_FEATURED_EVENTS)]},
];