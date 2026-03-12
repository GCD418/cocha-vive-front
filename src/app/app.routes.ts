import { Routes } from '@angular/router';
import { EventList } from './event-list/event-list';
import { EventDetails } from './event-details/event-details';
import { EventCreate } from './event-create/event-create';

export const routes: Routes = [
    { path: '', redirectTo: '', pathMatch: 'full' },
    { path: 'events', component: EventList },
    { path: 'events/create', component: EventCreate },
    { path: 'event-details/:id', component: EventDetails },

];
