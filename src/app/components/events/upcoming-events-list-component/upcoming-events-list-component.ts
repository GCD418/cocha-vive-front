import { Component, OnInit } from '@angular/core';
import { EventModel } from '../../../models/event-model/event-model';
import { EventService } from '../../../services/event-service/event.service';
import { EventCardComponent } from "../event-card-component/event-card-component";

@Component({
  selector: 'app-upcoming-events-list-component',
  imports: [EventCardComponent],
  templateUrl: './upcoming-events-list-component.html',
  styleUrl: './upcoming-events-list-component.css',
})
export class UpcomingEventsListComponent implements OnInit {
  events: EventModel[] = [];

  constructor(private eventService: EventService) { }

  ngOnInit(): void {
    this.getEvents()
  }

  private getEvents() {
    this.eventService.getUpcomingEvents().subscribe(data => {
      this.events = data;
    });
  }
}
