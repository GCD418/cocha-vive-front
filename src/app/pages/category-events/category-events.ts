import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category-services/category.service';
import { EventService } from '../../services/event-service/event.service';
import { EventModel } from '../../models/event-model'; 
import { EventCardComponent } from '../../components/events/event-card-component/event-card-component';

@Component({
  selector: 'app-category-events',
  standalone: true,
  imports: [CommonModule, RouterLink, EventCardComponent], 
  templateUrl: './category-events.html',
  styleUrl: './category-events.css'
})
export class CategoryEventsComponent implements OnInit {
  categoryName: string = '';
  categoryDetails: any = null;
  events: EventModel[] = []; 
  
  loading = true;
  errorLoading = false;
  currentPage: number = 1;
  itemsPerPage: number = 16;

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoryName = params['name'];
      this.loadData();
    });
  }

  loadData(): void {
  this.loading = true;
  this.errorLoading = false;
  this.currentPage = 1;

  this.categoryService.getCategoryByName(this.categoryName).subscribe({
    next: (categoryData) => {
      this.categoryDetails = categoryData;
      
      if (this.categoryDetails && this.categoryDetails.id) {
        this.eventService.getEventsByCategory(this.categoryDetails.id).subscribe({
          next: (eventsData) => {
            this.events = eventsData.sort((a, b) => {
              const dateA = new Date(a.dateStart).getTime();
              const dateB = new Date(b.dateStart).getTime();
              return dateA - dateB;
            });

            this.loading = false;
            
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
          },
          error: (err) => {
            console.error('❌ Error al cargar los eventos:', err);
            this.errorLoading = true;
            this.loading = false;
          }
        });
      } else {
        this.errorLoading = true;
        this.loading = false;
      }
    },
    error: (err) => {
      console.error('❌ Error al cargar la categoría:', err);
      this.errorLoading = true;
      this.loading = false;
    }
  });
}

  get paginatedEvents(): EventModel[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.events.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.events.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}