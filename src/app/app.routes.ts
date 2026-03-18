import { Routes } from '@angular/router';
import { EventList } from './pages/event-list/event-list';
import { HomeComponent } from './pages/home/home';
import { EventCreate } from './pages/event-create/event-create';
import { EventDetails } from './pages/event-details/event-details';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'events', component: EventList },
    { path: 'events/create', component: EventCreate },
    { path: 'event-details/:id', component: EventDetails },

];