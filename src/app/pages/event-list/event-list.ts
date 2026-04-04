import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { EventService } from '../../services/event-service/event.service';
import { Router, RouterLink } from '@angular/router';
import { EventModel } from '../../models/event-model';
import { AuthService, CurrentUser } from '../../services/auth/auth.service';
import { PricePipe } from '../../shared/pipes/price.pipe';
import { EventFormResult, EventFormComponent } from '../../components/events/event-form-component/event-form-component';
import { ConfirmModalComponent } from '../../shared/confirmModal-Component/confirmModal-component';
import { TranslateModule } from '@ngx-translate/core';
declare const bootstrap: any;

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    PricePipe, 
    EventFormComponent, 
    ConfirmModalComponent,
    NgClass,
    DatePipe,
    TranslateModule
  ],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList implements OnInit {

  events: EventModel[] = [];
  currentUser: CurrentUser | null = null;
  loading = true;
  selectedEvent: EventModel | null = null;
  showSuccessToast = false;
  cancellingId: number | null = null;
  pendingCancelId: number | null = null;

  private editModal: any;

  constructor(private eventService: EventService,
              private authService: AuthService,
              private router: Router) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;

      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.loadMyEvents(user.id);
    });

    this.authService.getCurrentUser().subscribe(user => {
      console.log('Usuario logueado:', user);
      console.log('Tipo de user.id:', typeof user?.id, '→ valor:', user?.id);
    });

    this.eventService.getEvents().subscribe(data => {
      data.forEach(e => {
        console.log(`Evento "${e.title}" → organizedByUser.id:`, e.organizedByUser.id, '| tipo:', typeof e.organizedByUser.id);
      });
    });
  }

  private loadMyEvents(userId: number): void {
    this.loading = true;
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events = data.filter(e => e.organizedByUser.id === userId);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  eventDetails(id: number): void {
    this.router.navigate(['/event-details', id]);
  }

  openEditModal(event: EventModel): void {
    this.selectedEvent = event;
    const modalEl = document.getElementById('editEventModal');
    if (modalEl) {
      this.editModal = new bootstrap.Modal(modalEl);
      this.editModal.show();
    }
  }

  onEditFormResult(result: EventFormResult): void {
    if (this.editModal) {
      this.editModal.hide();
    }
    this.selectedEvent = null;

    if (result.success) {
      this.showSuccessToast = true;
      setTimeout(() => { this.showSuccessToast = false; }, 500);

      if (this.currentUser) {
        this.loadMyEvents(this.currentUser.id);
      }
    }
  }

  openCancelModal(id: number): void {      
  this.pendingCancelId = id;
}

onCancelConfirmed(): void {              
  if (this.pendingCancelId === null) return;

  this.cancellingId = this.pendingCancelId;

  this.eventService.cancelEvent(this.pendingCancelId).subscribe({
    next: () => {
      this.events = this.events.filter(e => e.id !== this.pendingCancelId);
      this.cancellingId = null;
      this.pendingCancelId = null;
    },
    error: (err) => {
      console.error('Error al cancelar el evento', err);
      this.cancellingId = null;
      this.pendingCancelId = null;
    }
  });
}

  onCancelDismissed(): void {              
    this.pendingCancelId = null;
    this.cancellingId = null;
  }

  countByStatus(status: string): number {
    return this.events.filter(e => e.eventStatus === status).length;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado',
      CANCELLED: 'Cancelado',
    };
    return labels[status] ?? status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'bg-warning text-dark',
      APPROVED: 'bg-success',
      REJECTED: 'bg-danger',
      CANCELLED: 'bg-secondary',
    };
    return classes[status] ?? 'bg-secondary';
  }
}