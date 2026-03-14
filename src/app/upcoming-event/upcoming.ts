import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventModel } from '../event-model'; 
import { EventService } from '../event-service'; 
import * as AOS from 'aos';

@Component({
  selector: 'app-upcoming-event',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './upcoming-event.html',
  styleUrl: './upcoming-event.css'
})
export class UpcomingEventComponent implements OnInit {

  events: EventModel[] = [];
  loading = true;
  errorLoading = false;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.eventService.getUpcomingEvents().subscribe({
      next: (data) => {
        console.log('✅ Próximos Eventos ordenados recibidos:', data);
        this.events = data;
        this.loading = false;
        
        setTimeout(() => {
          AOS.refresh();
        }, 100);
      },
      error: (err) => {
        console.error('❌ Error al cargar próximos eventos:', err);
        this.loading = false;
        this.errorLoading = true;
      }
    });
  }

}