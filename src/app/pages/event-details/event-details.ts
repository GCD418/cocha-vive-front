import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EventModel } from '../../models/event-model';
import { EventService } from '../../services/event-service/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PricePipe } from '../../shared/pipes/price.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { EventMapModalComponent } from '../../components/events/event-map-modal/event-map-modal';


@Component({
  selector: 'app-event-details',
  imports: [CommonModule, PricePipe, TranslateModule, EventMapModalComponent],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails implements OnInit {
  event: EventModel | null = null;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.eventService.getEventById(id).subscribe(data => {
      this.event = data;
    });
  }

  goBack(): void {
    this.router.navigate(['/explore-events']);
  }

}
