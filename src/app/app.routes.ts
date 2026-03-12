import { Routes } from '@angular/router';
import { EventList } from './event-list/event-list';

export const routes: Routes = [
    { path: '', redirectTo: '', pathMatch: 'full' },
    { path: 'eventos', component: EventList },
];
