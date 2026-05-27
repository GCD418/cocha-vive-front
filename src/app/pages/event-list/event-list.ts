import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { EventService } from '../../services/event-service/event.service';
import { Router, RouterLink } from '@angular/router';
import { EventModel } from '../../models/event-model';
import { AuthService, CurrentUser } from '../../services/auth/auth.service';
import { EventFormResult, EventFormComponent } from '../../components/events/event-form-component/event-form-component';
import { ConfirmModalComponent } from '../../shared/confirmModal-Component/confirmModal-component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

declare const bootstrap: any;

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    EventFormComponent,
    ConfirmModalComponent,
    NgClass,
    DatePipe,
    FormsModule,
    NgClass,
    DatePipe,
    TranslateModule
  ],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList implements OnInit {
  private eventService = inject(EventService);
  public authService = inject(AuthService);
  private router = inject(Router);

  events = signal<EventModel[]>([]);

  loading = signal(true);
  selectedEvent = signal<EventModel | null>(null);
  showSuccessToast = signal(false);
  cancellingId = signal<number | null>(null);
  pendingCancelId = signal<number | null>(null);

  searchText = signal('');
  filterStatus = signal('');
  filterCategory = signal('');
  filterType = signal('');
  filterDateFrom = signal('');
  filterDateTo = signal('');

  currentPage = signal(1);
  readonly pageSize = 15;

  readonly currentUser = toSignal<CurrentUser | null>(this.authService.getCurrentUser(), {
    initialValue: null,
  });

  readonly availableCategories = computed(() =>
    [...new Set(this.events().map((event) => event.categoryName).filter(Boolean))] as string[]
  );

  readonly filteredEvents = computed(() => {
    const searchText = this.searchText().trim().toLowerCase();
    const filterDateFrom = this.filterDateFrom();
    const filterDateTo = this.filterDateTo();
    const filterType = this.filterType();
    const filterStatus = this.filterStatus();
    const filterCategory = this.filterCategory();

    return this.events().filter((event) => {
      if (searchText && !event.title.toLowerCase().includes(searchText)) {
        return false;
      }

      if (filterDateFrom && new Date(event.dateStart) < new Date(filterDateFrom)) {
        return false;
      }

      if (filterDateTo && new Date(event.dateStart) > new Date(filterDateTo)) {
        return false;
      }

      if (filterType) {
        const typeMatch = filterType === 'gratis' ? event.cost === 0 : event.cost > 0;
        if (!typeMatch) {
          return false;
        }
      }

      if (filterStatus && event.eventStatus !== filterStatus) {
        return false;
      }

      if (filterCategory && event.categoryName !== filterCategory) {
        return false;
      }

      return true;
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredEvents().length / this.pageSize)));

  readonly totalPagesArray = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1)
  );

  readonly pagedEvents = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredEvents().slice(start, start + this.pageSize);
  });

  readonly hasActiveFilters = computed(() =>
    Boolean(
      this.searchText() ||
      this.filterStatus() ||
      this.filterCategory() ||
      this.filterType() ||
      this.filterDateFrom() ||
      this.filterDateTo()
    )
  );

  private editModal: any;

  constructor() {
    effect(() => {
      const user = this.currentUser();

      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.loadMyEvents(user.id);
    });
  }

  ngOnInit(): void {}

  private loadMyEvents(_userId: number): void {
    this.loading.set(true);
    this.eventService.getMyEvents().subscribe({
      next: (data) => {
        this.events.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  eventDetails(id: number): void {
    this.router.navigate(['/event-details', id]);
  }

  openEditModal(event: EventModel): void {
    this.selectedEvent.set(event);
    const modalEl = document.getElementById('editEventModal');
    if (modalEl) {
      this.editModal = new bootstrap.Modal(modalEl);
      this.editModal.show();
    }
  }

  onEditFormResult(result: EventFormResult): void {
    if (this.editModal) {
      this.editModal.hide();
    }
    this.selectedEvent.set(null);

    if (result.success) {
      this.showSuccessToast.set(true);
      setTimeout(() => { this.showSuccessToast.set(false); }, 500);

      const user = this.currentUser();
      if (user) {
        this.loadMyEvents(user.id);
      }
    }
  }

  openCancelModal(id: number): void {      
    this.pendingCancelId.set(id);
  }

  onCancelConfirmed(): void {              
    const pendingCancelId = this.pendingCancelId();
    if (pendingCancelId === null) return;

    this.cancellingId.set(pendingCancelId);

    this.eventService.cancelEvent(pendingCancelId).subscribe({
      next: () => {
        this.events.update((events) => events.filter((event) => event.id !== pendingCancelId));
        this.cancellingId.set(null);
        this.pendingCancelId.set(null);
      },
      error: (err) => {
        console.error('Error al cancelar el evento', err);
        this.cancellingId.set(null);
        this.pendingCancelId.set(null);
      }
    });
  }

  onCancelDismissed(): void {              
    this.pendingCancelId.set(null);
    this.cancellingId.set(null);
  }

  countByStatus(status: string): number {
    return this.events().filter((event) => event.eventStatus === status).length;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado',
      CANCELLED: 'Cancelado',
    };
    return labels[status] ?? status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'bg-warning text-dark',
      APPROVED: 'bg-success',
      REJECTED: 'bg-danger',
      CANCELLED: 'bg-secondary',
    };
    return classes[status] ?? 'bg-secondary';
  }

  clearFilters(): void {
    this.searchText.set('');
    this.filterStatus.set('');
    this.filterCategory.set('');
    this.filterType.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.onFilterChange();
  }

}
