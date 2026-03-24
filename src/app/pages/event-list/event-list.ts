import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event-service/event.service';
import { Router, RouterLink } from '@angular/router';
import { EventModel } from '../../models/event-model';
import { AuthService, CurrentUser } from '../../services/auth/auth.service';
import { PricePipe } from '../../shared/pipes/price.pipe';
import { EventFormResult, EventFormComponent } from '../../components/events/event-form-component/event-form-component';

declare const bootstrap: any;

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PricePipe, EventFormComponent],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList {

  events: EventModel[] = [];
  currentUser: CurrentUser | null = null;
  loading = true;
  selectedEvent: EventModel | null = null;

   private editModal: any;

  constructor(private eventService : EventService,
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

  eventDetails(id: number){
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

    if (result.success && this.currentUser) {
      this.loadMyEvents(this.currentUser.id);
    }
  }


}
