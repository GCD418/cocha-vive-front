import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { EventModel } from '../../models/event-model';
import { EventService } from '../../services/event-service/event.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PricePipe } from '../../shared/pipes/price.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { EventMapModalComponent } from '../../components/events/event-map-modal/event-map-modal';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-event-details',
  imports: [CommonModule, PricePipe, TranslateModule, EventMapModalComponent, RouterModule],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private router = inject(Router);
  private liveAnnouncer = inject(LiveAnnouncer);

  event = signal<EventModel | null>(null);

  private eventId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: 0 }
  );

  constructor() {
    effect(() => {
      const eventId = this.eventId();
      if (!eventId) {
        return;
      }

      this.eventService.getEventById(eventId).subscribe((data) => {
        this.event.set(data);
        // Anunciar carga del evento para lectores de pantalla
        this.liveAnnouncer.announce(`Evento cargado: ${data.title}. ${data.shortDescription}`, 'polite');
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/explore-events']);
    this.liveAnnouncer.announce('Volviendo a la página de explorar eventos', 'polite');
  }
}