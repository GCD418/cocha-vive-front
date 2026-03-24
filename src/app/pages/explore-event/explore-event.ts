import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event-service/event.service';
import { EventModel } from '../../models/event-model';
import { EventCardComponent } from '../../components/events/event-card-component/event-card-component';

@Component({
  selector: 'app-explore-event',
  standalone: true,
  imports: [CommonModule, FormsModule, EventCardComponent],
  templateUrl: './explore-event.html',
  styleUrl: './explore-event.css',
})
export class ExploreEvent implements OnInit{
  allEvents: EventModel[] = [];
  filteredEvents: EventModel[] = [];
 
  searchQuery = '';
  loading = true;
  errorLoading = false;
 
  currentPage = 1;
  readonly itemsPerPage = 12;
 
  constructor(private eventService: EventService) {}
 
  ngOnInit(): void {
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.allEvents = data;
        this.filteredEvents = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar eventos:', err);
        this.errorLoading = true;
        this.loading = false;
      },
    });
  }
 
  onSearch(): void {
    this.currentPage = 1;
    const q = this.searchQuery.trim().toLowerCase();
 
    if (!q) {
      this.filteredEvents = this.allEvents;
      return;
    }
 
    this.filteredEvents = this.allEvents.filter((event) => {
      const inTitle = event.title?.toLowerCase().includes(q);
      const inShortDesc = event.shortDescription?.toLowerCase().includes(q);
      const inDesc = event.description?.toLowerCase().includes(q);
      const inLocation = event.shortPlaceDescription?.toLowerCase().includes(q);
      const inTags = event.tags?.some((tag) => tag.toLowerCase().includes(q));
      return inTitle || inShortDesc || inDesc || inLocation || inTags;
    });
  }
 
  clearSearch(): void {
    this.searchQuery = '';
    this.filteredEvents = this.allEvents;
    this.currentPage = 1;
  }
 
  get paginatedEvents(): EventModel[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEvents.slice(start, start + this.itemsPerPage);
  }
 
  get totalPages(): number {
    return Math.ceil(this.filteredEvents.length / this.itemsPerPage);
  }
 
  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
 
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
