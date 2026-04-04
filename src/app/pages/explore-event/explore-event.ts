import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event-service/event.service';
import { CategoryService } from '../../services/category-services/category.service';
import { EventModel } from '../../models/event-model';
import { Category } from '../../models/category.model';
import { EventCardComponent } from '../../components/events/event-card-component/event-card-component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-explore-event',
  standalone: true,
  imports: [CommonModule, FormsModule, EventCardComponent, TranslateModule],
  templateUrl: './explore-event.html',
  styleUrl: './explore-event.css',
})
export class ExploreEvent implements OnInit {
  allEvents: EventModel[] = [];
  filteredEvents: EventModel[] = [];
  categories: Category[] = [];

  searchQuery = '';
  startDate: string = '';
  endDate: string = '';
  eventType: 'ALL' | 'FREE' | 'PAID' = 'ALL';
  minPrice: number | null | string = null;
  maxPrice: number | null | string = null;
  selectedCategoryId: number | null = null;

  loading = true;
  errorLoading = false;

  currentPage = 1;
  readonly itemsPerPage = 12;

  private priceDebounceTimer: any = null;

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('❌ Error al cargar categorías:', err);
      }
    });

    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.allEvents = this.sortEventsByDate(data);
        this.filteredEvents = [...this.allEvents];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar eventos:', err);
        this.errorLoading = true;
        this.loading = false;
      },
    });
  }

  private sortEventsByDate(events: EventModel[]): EventModel[] {
    return events.sort((a, b) => {
      const dateA = new Date(a.dateStart || 0).getTime();
      const dateB = new Date(b.dateStart || 0).getTime();
      return dateA - dateB;
    });
  }

  onPriceChange(): void {
    if (this.priceDebounceTimer) {
      clearTimeout(this.priceDebounceTimer);
    }
    this.priceDebounceTimer = setTimeout(() => {
      this.applyFilters();
    }, 600);
  }

  applyFilters(): void {
    this.currentPage = 1;
    const q = this.searchQuery.trim().toLowerCase();

    let tempEvents = this.allEvents.filter((event) => {

      // 1. Filtro de texto
      let matchesText = true;
      if (q) {
        const inTitle     = event.title?.toLowerCase().includes(q);
        const inShortDesc = event.shortDescription?.toLowerCase().includes(q);
        const inDesc      = event.description?.toLowerCase().includes(q);
        const inLocation  = event.shortPlaceDescription?.toLowerCase().includes(q);
        const inTags      = event.tags?.some((tag) => tag.toLowerCase().includes(q));
        matchesText = !!(inTitle || inShortDesc || inDesc || inLocation || inTags);
      }

      // 2. Filtro de fechas
      let matchesDate = true;
      if (this.startDate || this.endDate) {
        const eventDate = new Date(event.dateStart).getTime();
        if (this.startDate) {
          matchesDate = matchesDate && eventDate >= new Date(this.startDate).getTime();
        }
        if (this.endDate) {
          matchesDate = matchesDate && eventDate <= (new Date(this.endDate).getTime() + 86399999);
        }
      }

      // 3. Filtro de tipo + precio del evento
      const eventPrice = Number(event.cost ?? 0);

      let matchesType = true;
      if (this.eventType === 'FREE') matchesType = eventPrice === 0;
      if (this.eventType === 'PAID') matchesType = eventPrice > 0;

      // 4. Filtro de rango de precios
      // El usuario escribe en Bs. (ej: 250), se multiplica x100 para comparar con el valor real en BD
      let matchesPrice = true;
      if (this.eventType !== 'FREE') {
        const minRaw = (this.minPrice !== null && this.minPrice !== '')
                       ? Number(this.minPrice) : null;
        const maxRaw = (this.maxPrice !== null && this.maxPrice !== '')
                       ? Number(this.maxPrice) : null;

        const min = (minRaw !== null && isFinite(minRaw)) ? minRaw * 100 : null;
        const max = (maxRaw !== null && isFinite(maxRaw)) ? maxRaw * 100 : null;

        if (min !== null) {
          matchesPrice = matchesPrice && eventPrice >= min;
        }
        if (max !== null) {
          matchesPrice = matchesPrice && eventPrice <= max;
        }
      }

      // 5. Filtro de categoría
      let matchesCategory = true;
      if (this.selectedCategoryId !== null) {
        matchesCategory = event.category?.id === this.selectedCategoryId;
      }

      return matchesText && matchesDate && matchesType && matchesPrice && matchesCategory;
    });

    this.filteredEvents = this.sortEventsByDate(tempEvents);
  }

  onTypeChange(): void {
    if (this.eventType === 'FREE') {
      this.minPrice = null;
      this.maxPrice = null;
    }
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.startDate = '';
    this.endDate = '';
    this.eventType = 'ALL';
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedCategoryId = null;
    this.applyFilters();
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