import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { EventService } from '../../services/event-service/event.service';
import { Router, RouterLink } from '@angular/router';
import { EventModel } from '../../models/event-model';
import { AuthService, CurrentUser } from '../../services/auth/auth.service';
import { EventFormResult, EventFormComponent } from '../../components/events/event-form-component/event-form-component';
import { ConfirmModalComponent } from '../../shared/confirmModal-Component/confirmModal-component';
import { FormsModule } from '@angular/forms';

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
    FormsModule
  ],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList implements OnInit {

  events: EventModel[] = [];
  filteredEvents: EventModel[] = [];
  pagedEvents: EventModel[] = [];
  availableCategories: string[] = [];

  currentUser: CurrentUser | null = null;
  loading = true;
  selectedEvent: EventModel | null = null;
  showSuccessToast = false;
  cancellingId: number | null = null;
  pendingCancelId: number | null = null;

  searchText = '';
  filterStatus = '';
  filterCategory = '';

  filterType = '';
  filterDateFrom = '';
  filterDateTo = '';

  currentPage = 1;
  pageSize = 15;
  totalPages = 1;
  totalPagesArray: number[] = [];

  private editModal: any;

  constructor(private eventService: EventService,
              private authService: AuthService,
              private router: Router) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;

      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.loadMyEvents(user.id);
    });

    this.authService.getCurrentUser().subscribe(user => {
      console.log('Usuario logueado:', user);
      console.log('Tipo de user.id:', typeof user?.id, '→ valor:', user?.id);
    });

    this.eventService.getEvents().subscribe(data => {
      data.forEach(e => {
        console.log(`Evento "${e.title}" → organizedByUser.id:`, e.organizedByUser.id, '| tipo:', typeof e.organizedByUser.id);
      });
    });
  }

  private loadMyEvents(userId: number): void {
    this.loading = true;
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events = data.filter(e => e.organizedByUser.id === userId);
        this.availableCategories = [...new Set(this.events.map(e => e.category?.name).filter(Boolean))] as string[];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.events];

    if (this.searchText.trim()) {
      const term = this.searchText.toLowerCase();
      result = result.filter(e => e.title.toLowerCase().includes(term));
    }

    if (this.filterDateFrom) {
      const from = new Date(this.filterDateFrom);
      result = result.filter(e => new Date(e.dateStart) >= from);
    }

    if (this.filterDateTo) {
      const to = new Date(this.filterDateTo);
      result = result.filter(e => new Date(e.dateStart) <= to);
    }

    if (this.filterType) {
      result = result.filter(e =>
        this.filterType === 'gratis' ? e.cost === 0 : e.cost > 0
      );
    }

    if (this.filterStatus) {
      result = result.filter(e => e.eventStatus === this.filterStatus);
    }

    if (this.filterCategory) {
      result = result.filter(e => e.category?.name === this.filterCategory);
    }

    this.filteredEvents = result;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredEvents.length / this.pageSize));
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updatePagedEvents();
  }

  updatePagedEvents(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedEvents = this.filteredEvents.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagedEvents();
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  eventDetails(id: number): void {
    this.router.navigate(['/event-details', id]);
  }

  openEditModal(event: EventModel): void {
    this.selectedEvent = event;
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
    this.selectedEvent = null;

    if (result.success) {
      this.showSuccessToast = true;
      setTimeout(() => { this.showSuccessToast = false; }, 500);

      if (this.currentUser) {
        this.loadMyEvents(this.currentUser.id);
      }
    }
  }

  openCancelModal(id: number): void {      
  this.pendingCancelId = id;
}

  onCancelConfirmed(): void {              
    if (this.pendingCancelId === null) return;

    this.cancellingId = this.pendingCancelId;

    this.eventService.cancelEvent(this.pendingCancelId).subscribe({
      next: () => {
        this.events = this.events.filter(e => e.id !== this.pendingCancelId);
        this.cancellingId = null;
        this.pendingCancelId = null;
      },
      error: (err) => {
        console.error('Error al cancelar el evento', err);
        this.cancellingId = null;
        this.pendingCancelId = null;
      }
    });
  }

  onCancelDismissed(): void {              
    this.pendingCancelId = null;
    this.cancellingId = null;
  }

  countByStatus(status: string): number {
    return this.events.filter(e => e.eventStatus === status).length;
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

  hasActiveFilters(): boolean {
    return !!(this.searchText || this.filterStatus || this.filterCategory || this.filterType || this.filterDateFrom || this.filterDateTo);
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterStatus = '';
    this.filterCategory = '';
    this.filterType = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.onFilterChange();
  }
}