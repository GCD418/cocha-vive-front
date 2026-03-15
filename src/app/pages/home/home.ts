import { Component } from '@angular/core';
import { HeroComponent } from '../../layout/hero/hero';
import { Categories } from '../../categories/categories';
import { UpcomingEventComponent } from '../../upcoming-event/upcoming';
import { UpcomingEventsListComponent } from '../../components/events/upcoming-events-list-component/upcoming-events-list-component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, Categories, UpcomingEventComponent, UpcomingEventsListComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {

}