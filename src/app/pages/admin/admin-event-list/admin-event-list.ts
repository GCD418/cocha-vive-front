import { Component, OnInit } from '@angular/core';
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
  events: EventModel[] = [];
  filteredEvents: EventModel[] = [];
  pagedEvents: EventModel[] = [];
  availableCategories: string[] = [];

  loading = true;
  searchText = '';
  filterStatus = 'PENDING'; // por defecto pendientes
  filterCategory = '';
  filterType = '';
  filterDateFrom = '';
  filterDateTo = '';

  currentPage = 1;
  pageSize = 15;
  totalPages = 1;
  totalPagesArray: number[] = [];

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllEvents();
  }

  private loadAllEvents(): void {
    this.loading = true;
    this.eventService.getAllEventsForAdmin().subscribe({
      next: (data) => {
        this.events = data;
        this.availableCategories = [
          ...new Set(this.events.map(e => e.category?.name).filter(Boolean))
        ] as string[];
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
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
      result = result.filter(e => 
        e.title.toLowerCase().includes(term) ||
        this.getFullName(e.organizedByUser).toLowerCase().includes(term)
      );
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

  eventDetails(id: number): void {
    this.router.navigate(['/event-details', id]);
  }

  approve(id: number): void {
    this.eventService.approveEvent(id).subscribe({
      next: () => this.loadAllEvents()
    });
  }

  reject(id: number): void {
    this.eventService.rejectEvent(id).subscribe({
      next: () => this.loadAllEvents()
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

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
  
  getFullName(user: UserDTO): string {
    return [user.names, user.firstLastName, user.secondLastName]
      .filter(Boolean)
      .join(' ');
  }
}
