import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EventModel } from '../event-model';
import { EventService } from '../event-service';
import { ActivatedRoute, Router } from '@angular/router';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-event-details',
  imports: [CommonModule],
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
    this.router.navigate(['/events']);
  }

}
