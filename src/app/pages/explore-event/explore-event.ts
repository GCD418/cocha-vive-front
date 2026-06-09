import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event-service/event.service';
import { CategoryService } from '../../services/category-services/category.service';
import { EventModel } from '../../models/event-model';
import { Category } from '../../models/category.model';
import { EventCardComponent } from '../../components/events/event-card-component/event-card-component';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state';
import { ErrorBannerComponent } from '../../shared/error-banner/error-banner';

@Component({
  selector: 'app-explore-event',
  standalone: true,
  imports: [CommonModule, FormsModule, EventCardComponent, TranslateModule, LoadingSpinnerComponent, EmptyStateComponent, ErrorBannerComponent],
  templateUrl: './explore-event.html',
  styleUrl: './explore-event.css',
})
export class ExploreEvent implements OnInit {
  allEvents = signal<EventModel[]>([]);
  categories = signal<Category[]>([]);

  searchQuery = signal('');
  startDate = signal('');
  endDate = signal('');
  eventType = signal<'ALL' | 'FREE' | 'PAID'>('ALL');
  minPrice = signal<number | null | string>(null);
  maxPrice = signal<number | null | string>(null);
  selectedCategoryId = signal<number | null>(null);

  loading = signal(true);
  errorLoading = signal(false);

  currentPage = signal(1);
  readonly itemsPerPage = 12;
  private appliedMinPrice = signal<number | null>(null);
  private appliedMaxPrice = signal<number | null>(null);

  readonly filteredEvents = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const startDate = this.startDate();
    const endDate = this.endDate();
    const eventType = this.eventType();
    const selectedCategoryId = this.selectedCategoryId();
    const min = this.appliedMinPrice();
    const max = this.appliedMaxPrice();

    const filtered = this.allEvents().filter((event) => {
      if (query) {
        const inTitle = event.title?.toLowerCase().includes(query);
        const inShortDesc = event.shortDescription?.toLowerCase().includes(query);
        const inDesc = event.description?.toLowerCase().includes(query);
        const inLocation = event.shortPlaceDescription?.toLowerCase().includes(query);
        const inTags = event.tags?.some((tag) => tag.toLowerCase().includes(query));
        if (!(inTitle || inShortDesc || inDesc || inLocation || inTags)) {
          return false;
        }
      }

      const eventDate = new Date(event.dateStart).getTime();
      if (startDate && eventDate < new Date(startDate).getTime()) {
        return false;
      }
      if (endDate && eventDate > (new Date(endDate).getTime() + 86399999)) {
        return false;
      }

      const eventPrice = Number(event.cost ?? 0);
      if (eventType === 'FREE' && eventPrice !== 0) {
        return false;
      }
      if (eventType === 'PAID' && eventPrice <= 0) {
        return false;
      }

      if (eventType !== 'FREE') {
        if (min !== null && eventPrice < min) {
          return false;
        }
        if (max !== null && eventPrice > max) {
          return false;
        }
      }

      if (selectedCategoryId !== null && event.categoryId !== selectedCategoryId) {
        return false;
      }

      return true;
    });

    return this.sortEventsByDate(filtered);
  });

  readonly totalPages = computed(() => Math.ceil(this.filteredEvents().length / this.itemsPerPage));

  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1)
  );

  readonly paginatedEvents = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredEvents().slice(start, start + this.itemsPerPage);
  });

  private priceDebounceTimer: any = null;

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
      },
      error: (err) => {
        console.error('❌ Error al cargar categorías:', err);
      }
    });

    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.allEvents.set(this.sortEventsByDate(data));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error al cargar eventos:', err);
        this.errorLoading.set(true);
        this.loading.set(false);
      },
    });
  }

  private sortEventsByDate(events: EventModel[]): EventModel[] {
    return [...events].sort((a, b) => {
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
      this.applyPriceFilters();
      this.currentPage.set(1);
    }, 600);
  }

  onFilterChange(): void {
    this.currentPage.set(1);
  }

  onTypeChange(): void {
    if (this.eventType() === 'FREE') {
      this.minPrice.set(null);
      this.maxPrice.set(null);
      this.appliedMinPrice.set(null);
      this.appliedMaxPrice.set(null);
    }
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.eventType.set('ALL');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.appliedMinPrice.set(null);
    this.appliedMaxPrice.set(null);
    this.selectedCategoryId.set(null);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private applyPriceFilters(): void {
    const minRaw = this.minPrice();
    const maxRaw = this.maxPrice();

    const parsedMin = minRaw !== null && minRaw !== '' ? Number(minRaw) : null;
    const parsedMax = maxRaw !== null && maxRaw !== '' ? Number(maxRaw) : null;

    this.appliedMinPrice.set(parsedMin !== null && isFinite(parsedMin) ? parsedMin * 100 : null);
    this.appliedMaxPrice.set(parsedMax !== null && isFinite(parsedMax) ? parsedMax * 100 : null);
  }
}
