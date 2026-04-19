import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../services/event-service/event.service';
import { EventModel } from '../../../models/event-model';
import { UserDTO } from '../../../models/event-model';

@Component({
  selector: 'app-admin-event-list',
  imports: [CommonModule, NgClass, DatePipe, FormsModule, TranslateModule],
  templateUrl: './admin-event-list.html',
  styleUrl: './admin-event-list.css',
})
export class AdminEventListComponent implements OnInit{
  events = signal<EventModel[]>([]);

  loading = signal(true);
  searchText = signal('');
  filterStatus = signal('PENDING');
  filterCategory = signal('');
  filterType = signal('');
  filterDateFrom = signal('');
  filterDateTo = signal('');

  currentPage = signal(1);
  readonly pageSize = 15;

  toastMessage = signal('');
  toastType = signal<'success' | 'danger'>('success');
  showToast = signal(false);

  readonly availableCategories = computed(() =>
    [...new Set(this.events().map((event) => event.category?.name).filter(Boolean))] as string[]
  );

  readonly filteredEvents = computed(() => {
    const searchText = this.searchText().trim().toLowerCase();
    const filterDateFrom = this.filterDateFrom();
    const filterDateTo = this.filterDateTo();
    const filterType = this.filterType();
    const filterStatus = this.filterStatus();
    const filterCategory = this.filterCategory();

    return this.events().filter((event) => {
      if (searchText) {
        const fullName = this.getFullName(event.organizedByUser).toLowerCase();
        const matchesSearch =
          event.title.toLowerCase().includes(searchText) ||
          fullName.includes(searchText);

        if (!matchesSearch) {
          return false;
        }
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

      if (filterCategory && event.category?.name !== filterCategory) {
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

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllEvents();
  }

  private loadAllEvents(): void {
    this.loading.set(true);
    this.eventService.getAllEventsForAdmin().subscribe({
      next: (data) => {
        this.events.set(data);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  onFilterChange(): void {
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  private showNotification(message: string, type: 'success' | 'danger'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => { this.showToast.set(false); }, 4500);
  }

  eventDetails(id: number): void {
    this.router.navigate(['/event-details', id]);
  }

  approve(id: number): void {
    this.eventService.approveEvent(id).subscribe({
      next: () => {
        this.loadAllEvents();
        setTimeout(() => this.showNotification('ADMIN_EVENTS.TOAST.APPROVED', 'success'), 0);
      },
      error: () => this.showNotification('ADMIN_EVENTS.TOAST.ERROR', 'danger')
    });
  }

  reject(id: number): void {
    this.eventService.rejectEvent(id).subscribe({
      next: () => {
        this.loadAllEvents();
        setTimeout(() => this.showNotification('ADMIN_EVENTS.TOAST.REJECTED', 'danger'), 0);
      },
      error: () => this.showNotification('ADMIN_EVENTS.TOAST.ERROR', 'danger')
    });
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

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
  
  getFullName(user: UserDTO): string {
    return [user.names, user.firstLastName, user.secondLastName]
      .filter(Boolean)
      .join(' ');
  }
  
}
