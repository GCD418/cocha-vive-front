import { Routes } from '@angular/router';
import { EventList } from './event-list/event-list';
import { EventDetails } from './event-details/event-details';
import { HomeComponent } from './pages/home/home';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },  // redirección inicial
  { path: 'home', component: HomeComponent },
  { path: 'events', component: EventList },
  { path: 'event-details/:id', component: EventDetails }
];