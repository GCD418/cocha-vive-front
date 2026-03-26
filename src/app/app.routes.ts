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

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'events', component: EventList },
    {
        path: 'events/create',
        component: EventCreate,
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_PUBLISHER'] },
    },
    { path: 'event-details/:id', component: EventDetails },
    { path: 'category-events/:name', component: CategoryEventsComponent },
    { path: 'forbidden', component: ForbiddenPageComponent },
    { path: 'explore-events', component: ExploreEvent },
    { path: 'onboarding', component: OnboardingComponent, canActivate: [authGuard] },
];