import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event-service/event.service';
import { Router, RouterLink } from '@angular/router';
import { EventModel } from '../../models/event-model';
import { PricePipe } from '../../shared/pipes/price.pipe';
import { EventFormResult, EventFormComponent } from '../../components/events/event-form-component/event-form-component';

declare const bootstrap: any;

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PricePipe],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList {

  events: EventModel[] = [];
  selectedEvent: EventModel | null = null;

   private editModal: any;

  constructor(private eventService : EventService,
              private router: Router) { }

  ngOnInit(): void {
    this.getEvents()
  }

  private getEvents() {
    this.eventService.getEvents().subscribe(data => {
      this.events = data;
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

    if (result.success) {
      this.getEvents();
    }
  }


}
