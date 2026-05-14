import { Component, inject, OnInit } from '@angular/core';
import { HeroComponent } from '../../layout/hero/hero';
import { CategoriesCard } from '../../components/categories/categories-card/categories-card';
import { FeaturedEventComponent } from '../../components/events/featured-event/featured-event';
import { UpcomingEventsListComponent } from '../../components/events/upcoming-events-list-component/upcoming-events-list-component';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, CategoriesCard, FeaturedEventComponent, UpcomingEventsListComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private liveAnnouncer = inject(LiveAnnouncer);

  ngOnInit(): void {
    // pa anunciar que la página de inicio ha cargado
    this.liveAnnouncer.announce('Bienvenido a la página de inicio de Cocha Vive. Explora eventos destacados y busca por categoría.', 'polite');
  }
}