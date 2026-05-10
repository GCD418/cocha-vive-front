import { Routes } from '@angular/router';
import { EventList } from './pages/event-list/event-list';
import { AdminEventListComponent } from './pages/admin/admin-event-list/admin-event-list';
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
import { SuperadminRoleManagementComponent } from './pages/admin/superadmin-role-management/superadmin-role-management';
import { FacebookVerifyEmail } from './pages/facebook-verify-email/facebook-verify-email';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'publisher/my-events', component: EventList, canActivate: [authGuard], data: { roles: ['ROLE_PUBLISHER'] } },
    { path: 'events/create', component: EventCreate, canActivate: [authGuard], data: { roles: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_PUBLISHER'] },},
    { path: 'admin/events', component: AdminEventListComponent, canActivate: [authGuard], data: { roles: ['ROLE_ADMIN'] }},
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
    {
        path: 'superadmin/admin-management',
        component: SuperadminRoleManagementComponent,
        canActivate: [authGuard],
        data: { roles: ['ROLE_SUPERADMIN'] },
    },
    { path: 'category-events/:name', component: CategoryEventsComponent },
    { path: 'forbidden', component: ForbiddenPageComponent },
    { path: 'explore-events', component: ExploreEvent },
    { path: 'onboarding', component: OnboardingComponent, canActivate: [authGuard] },
    {
        path: 'publisher-apply-form',
        loadComponent: () =>
            import('./pages/publisher-apply-form/publisher-apply-form')
            .then(m => m.PublisherApplyFormPageComponent),
        canActivate: [authGuard, requireFeature(AppFeatures.MANAGE_PUBLISHER_REQUESTS)],
        data: { roles: ['ROLE_USER'] },
    },
    {
        path: 'my-publisher-request',
        loadComponent: () =>
            import('./pages/my-publisher-request/my-publisher-request')
            .then(m => m.MyPublisherRequestPageComponent),
        canActivate: [authGuard, requireFeature(AppFeatures.MANAGE_PUBLISHER_REQUESTS)],
        data: { roles: ['ROLE_USER'] },
    },
    {
    path: 'facebook/verify-email',
    loadComponent: () =>
        import('./pages/facebook-verify-email/facebook-verify-email')
        .then(m => m.FacebookVerifyEmail)
    },
    {
    path: 'privacy-policy',
    loadComponent: () =>
        import('./pages/privacy-policy/privacy-policy')
        .then(m => m.PrivacyPolicy)
    },

    {
        path: 'my-tickets',
        loadComponent: () =>
            import('./pages/tickets/my-tickets/my-tickets')
            .then(m => m.MyTicketsPageComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_PUBLISHER', 'ROLE_SUPERADMIN'] },
    },
    {
        path: 'my-tickets/:id',
        loadComponent: () =>
            import('./pages/tickets/ticket-details/ticket-details')
            .then(m => m.TicketDetailsPageComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_PUBLISHER', 'ROLE_SUPERADMIN'] },
    },
];
