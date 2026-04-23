import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { EventModel } from '../../../models/event-model'; 
import { EventService } from '../../../services/event-service/event.service'; 
import * as AOS from 'aos';
import { PricePipe } from '../../../shared/pipes/price.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureToggleService } from '../../../services/feature-toggle/feature-toggle.service';
import { AppFeatures } from '../../../models/app-features';

@Component({
  selector: 'app-featured-event',
  standalone: true,
  imports: [RouterLink, DatePipe, PricePipe, TranslateModule],
  templateUrl: './featured-event.html',
  styleUrl: './featured-event.css'
})
export class FeaturedEventComponent implements OnInit {
  public featureService = inject(FeatureToggleService);
  public readonly AppFeatures = AppFeatures;

  events = signal<EventModel[]>([]);
  loading = signal(true);
  errorLoading = signal(false);

  readonly topEvents = computed(() => this.events().slice(0, 4));

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.eventService.getFeaturedEvents().subscribe({
      next: (data) => {
        console.log('✅ Eventos Destacados recibidos:', data);
        this.events.set(data);
        this.loading.set(false);
        
        setTimeout(() => {
          AOS.refresh();
        }, 100);
      },
      error: (err) => {
        console.error('❌ Error al cargar eventos destacados:', err);
        this.loading.set(false);
        this.errorLoading.set(true);
      }
    });
  }

}
