import { Component, inject, OnInit } from '@angular/core';
import { EventModel } from '../../../models/event-model';
import { EventService } from '../../../services/event-service/event.service';
import { EventCardComponent } from "../event-card-component/event-card-component";
import { TranslateModule } from '@ngx-translate/core';
import { FeatureToggleService } from '../../../services/feature-toggle/feature-toggle.service';

@Component({
  selector: 'app-upcoming-events-list-component',
  imports: [EventCardComponent, TranslateModule],
  templateUrl: './upcoming-events-list-component.html',
  styleUrl: './upcoming-events-list-component.css',
})
export class UpcomingEventsListComponent implements OnInit {
  events: EventModel[] = [];
  public featureService = inject(FeatureToggleService);

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
