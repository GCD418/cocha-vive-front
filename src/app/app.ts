import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Navbar } from './layout/navbar/navbar';
import { EventList } from './event-list/event-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, Navbar, EventList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
