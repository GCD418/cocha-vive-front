import { Routes } from '@angular/router';
import { EventList } from './event-list/event-list';
import { EventDetails } from './event-details/event-details';

export const routes: Routes = [
    { path: '', redirectTo: '', pathMatch: 'full' },
    { path: 'events', component: EventList },
    { path: 'event-details/:id', component: EventDetails },
];
