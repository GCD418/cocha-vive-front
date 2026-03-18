import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, SlicePipe } from '@angular/common';
import { EventModel } from '../../../models/event-model'; 
import { EventService } from '../../../services/event-service/event.service'; 
import * as AOS from 'aos';

@Component({
  selector: 'app-featured-event',
  standalone: true,
  imports: [RouterLink, DatePipe, SlicePipe],
  templateUrl: './featured-event.html',
  styleUrl: './featured-event.css'
})
export class FeaturedEventComponent implements OnInit {

  events: EventModel[] = [];
  loading = true;
  errorLoading = false;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.eventService.getFeaturedEvents().subscribe({
      next: (data) => {
        console.log('✅ Eventos Destacados recibidos:', data);
        this.events = data;
        this.loading = false;
        
        setTimeout(() => {
          AOS.refresh();
        }, 100);
      },
      error: (err) => {
        console.error('❌ Error al cargar eventos destacados:', err);
        this.loading = false;
        this.errorLoading = true;
      }
    });
  }

}