import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../services/category-services/category.service';
import { EventService } from '../../services/event-service/event.service';
import { EventModel } from '../../models/event-model'; 
import { EventCardComponent } from '../../components/events/event-card-component/event-card-component';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-category-events',
  standalone: true,
  imports: [CommonModule, EventCardComponent, TranslateModule], 
  templateUrl: './category-events.html',
  styleUrl: './category-events.css'
})
export class CategoryEventsComponent {
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);
  private eventService = inject(EventService);

  categoryName = toSignal(
    this.route.params.pipe(map((params) => params['name'] as string)),
    { initialValue: '' }
  );
  categoryDetails = signal<any | null>(null);
  events = signal<EventModel[]>([]); 
  
  loading = signal(true);
  errorLoading = signal(false);
  currentPage = signal(1);
  readonly itemsPerPage = 16;

  readonly totalPages = computed(() => Math.ceil(this.events().length / this.itemsPerPage));

  readonly paginatedEvents = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.events().slice(startIndex, startIndex + this.itemsPerPage);
  });

  constructor() {
    effect(() => {
      const name = this.categoryName();
      if (!name) {
        return;
      }

      this.loadData(name);
    });
  }

  loadData(categoryName: string): void {
    this.loading.set(true);
    this.errorLoading.set(false);
    this.currentPage.set(1);

    this.categoryService.getCategoryByName(categoryName).subscribe({
      next: (categoryData) => {
        this.categoryDetails.set(categoryData);

        if (categoryData && categoryData.id) {
          this.eventService.getEventsByCategory(categoryData.id).subscribe({
            next: (eventsData) => {
              this.events.set(
                [...eventsData].sort((a, b) => {
                  const dateA = new Date(a.dateStart).getTime();
                  const dateB = new Date(b.dateStart).getTime();
                  return dateA - dateB;
                })
              );

              this.loading.set(false);

              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 100);
            },
            error: (err) => {
              console.error('❌ Error al cargar los eventos:', err);
              this.errorLoading.set(true);
              this.loading.set(false);
            }
          });
        } else {
          this.errorLoading.set(true);
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar la categoría:', err);
        this.errorLoading.set(true);
        this.loading.set(false);
      }
    });
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
