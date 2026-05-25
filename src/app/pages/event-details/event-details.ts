import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { EventModel } from '../../models/event-model';
import { EventService } from '../../services/event-service/event.service';
import { AuthService } from '../../services/auth/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PricePipe } from '../../shared/pipes/price.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { EventMapModalComponent } from '../../components/events/event-map-modal/event-map-modal';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';


@Component({
  selector: 'app-event-details',
  imports: [CommonModule, PricePipe, TranslateModule, EventMapModalComponent, RouterModule],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private router = inject(Router);

  event = signal<EventModel | null>(null);

  private currentUser = toSignal(this.authService.getCurrentUser(), { initialValue: null });

  private eventId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: 0 }
  );

  readonly canPromote = computed(() => {
    const user = this.currentUser();
    const ev = this.event();
    if (!user || !ev) {
      return false;
    }
    return user.id === ev.organizedByUserId && user.role === 'ROLE_PUBLISHER';
  });

  constructor() {
    effect(() => {
      const eventId = this.eventId();
      if (!eventId) {
        return;
      }

      this.eventService.getEventById(eventId).subscribe((data) => {
        this.event.set(data);
      });
    });
  }

  private loadEvent(eventId: number): void {
    this.eventService.getEventById(eventId).subscribe((data) => {
      this.event.set(data);
    });
  }

  goBack(): void {
    this.router.navigate(['/explore-events']);
  }

}
