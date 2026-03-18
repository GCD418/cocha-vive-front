import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Navbar } from './layout/navbar/navbar';
import { EventList } from './pages/event-list/event-list';
import { EventDetails } from './pages/event-details/event-details';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, Navbar, EventList, EventDetails],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
