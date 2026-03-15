import { Component } from '@angular/core';
import { HeroComponent } from '../../layout/hero/hero';
import { Categories } from '../../categories/categories';
import { UpcomingEventsListComponent } from '../../components/events/upcoming-events-list-component/upcoming-events-list-component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, Categories, UpcomingEventsListComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {

}