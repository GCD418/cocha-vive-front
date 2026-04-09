import { Component } from '@angular/core';
import { HeroComponent } from '../../layout/hero/hero';
import { CategoriesCard } from '../../components/categories/categories-card/categories-card';
import { FeaturedEventComponent } from '../../components/events/featured-event/featured-event';
import { UpcomingEventsListComponent } from '../../components/events/upcoming-events-list-component/upcoming-events-list-component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, CategoriesCard, FeaturedEventComponent, UpcomingEventsListComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {

}