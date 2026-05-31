import { Component, inject, OnInit, signal } from '@angular/core';
import { EventModel } from '../../../models/event-model';
import { EventService } from '../../../services/event-service/event.service';
import { EventCardComponent } from "../event-card-component/event-card-component";
import { TranslateModule } from '@ngx-translate/core';
import { FeatureToggleService } from '../../../services/feature-toggle/feature-toggle.service';
import { AppFeatures } from '../../../models/app-features';

@Component({
  selector: 'app-upcoming-events-list-component',
  imports: [EventCardComponent, TranslateModule],
  templateUrl: './upcoming-events-list-component.html',
  styleUrl: './upcoming-events-list-component.css',
})
export class UpcomingEventsListComponent implements OnInit {
  events = signal<EventModel[]>([]);
  public featureService = inject(FeatureToggleService);
  public readonly AppFeatures = AppFeatures;

  constructor(private eventService: EventService) { }

  ngOnInit(): void {
    this.getEvents()
  }

  private getEvents() {
    this.eventService.getUpcomingEvents().subscribe(data => {
      this.events.set(data);
    });
  }
}
