import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../event-service';
import { Router, RouterLink } from '@angular/router';
import { EventModel } from '../event-model';

@Component({
  selector: 'app-event-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList {

  events: EventModel[] = [];

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
}
