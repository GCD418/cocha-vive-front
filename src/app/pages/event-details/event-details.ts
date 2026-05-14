import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, computed } from '@angular/core';
import { EventModel, EventStatus } from '../../models/event-model';
import { EventService } from '../../services/event-service/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PricePipe } from '../../shared/pipes/price.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { EventMapModalComponent } from '../../components/events/event-map-modal/event-map-modal';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ConfirmModalComponent } from '../../shared/confirmModal-Component/confirmModal-component';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-event-details',
  imports: [CommonModule, PricePipe, TranslateModule, EventMapModalComponent, ConfirmModalComponent],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private router = inject(Router);
  private liveAnnouncer = inject(LiveAnnouncer);
  private authService = inject(AuthService);

  event = signal<EventModel | null>(null);
  showCancelModal = signal(false);
  isCancelling = signal(false);
  currentUserId = signal<number | null>(null);

  private eventId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: 0 }
  );

  canCancel = computed(() => {
    const currentEvent = this.event();
    if (!currentEvent) return false;
    
    const userId = this.currentUserId();
    const userRole = this.authService.getRoleFromToken();
    const isOrganizer = currentEvent.organizedByUser?.id === userId;
    const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPERADMIN';
    const isNotCancelled = currentEvent.eventStatus !== EventStatus.CANCELLED;
    
    return (isOrganizer || isAdmin) && isNotCancelled;
  });

  constructor() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUserId.set(user.id);
      }
    });

    effect(() => {
      const eventId = this.eventId();
      if (!eventId) return;

      this.eventService.getEventById(eventId).subscribe((data) => {
        this.event.set(data);
        this.liveAnnouncer.announce(`Cargados detalles del evento: ${data.title}. ${data.shortDescription}`, 'polite');
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/explore-events']);
    this.liveAnnouncer.announce('Volviendo a la página de explorar eventos', 'polite');
  }

  openCancelModal(): void {
    this.showCancelModal.set(true);
    this.liveAnnouncer.announce('Abriendo modal de confirmación para cancelar el evento', 'polite');
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
    this.isCancelling.set(false);
    this.liveAnnouncer.announce('Modal de cancelación cerrado', 'polite');
  }

  confirmCancel(): void {
    const currentEvent = this.event();
    if (!currentEvent) return;

    this.isCancelling.set(true);
    
    this.eventService.cancelEvent(currentEvent.id).subscribe({
      next: () => {
        this.liveAnnouncer.announce(`Evento ${currentEvent.title} ha sido cancelado exitosamente`, 'assertive');
        this.event.set({ ...currentEvent, eventStatus: EventStatus.CANCELLED });
        this.showCancelModal.set(false);
        this.isCancelling.set(false);
      },
      error: (err) => {
        console.error('Error cancelando evento:', err);
        this.liveAnnouncer.announce('Error al cancelar el evento. Por favor intente nuevamente', 'assertive');
        this.isCancelling.set(false);
      }
    });
  }
}