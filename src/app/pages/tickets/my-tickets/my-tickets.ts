import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TicketResponseDTO } from '../../../models/ticket.model';
import { TicketService } from '../../../services/ticket-service/ticket.service';
import { PricePipe } from '../../../shared/pipes/price.pipe';

type TicketStatus = 'ACTIVE' | 'USED' | 'EXPIRED';

@Component({
  selector: 'app-my-tickets-page',
  imports: [CommonModule, RouterLink, TranslateModule, PricePipe],
  templateUrl: './my-tickets.html',
  styleUrl: './my-tickets.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyTicketsPageComponent {
  private readonly ticketService = inject(TicketService);

  readonly tickets = signal<TicketResponseDTO[]>([]);
  readonly loading = signal(false);
  readonly error = signal(false);

  // Filters: initially only active & not used.
  readonly includeUsed = signal(false);
  readonly includeExpired = signal(false);

  readonly filteredTickets = computed(() => {
    const includeUsed = this.includeUsed();
    const includeExpired = this.includeExpired();

    return [...this.tickets()]
      .filter((t) => (includeUsed ? true : !t.used))
      .filter((t) => (includeExpired ? true : !t.expired))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  readonly totalCount = computed(() => this.tickets().length);
  readonly activeCount = computed(() => this.tickets().filter((t) => !t.used && !t.expired).length);
  readonly usedCount = computed(() => this.tickets().filter((t) => t.used).length);
  readonly expiredCount = computed(() => this.tickets().filter((t) => t.expired).length);

  constructor() {
    effect(() => {
      this.loadTickets();
    });
  }

  refresh(): void {
    this.loadTickets();
  }

  private loadTickets(): void {
    this.loading.set(true);
    this.error.set(false);

    this.ticketService.getMyTickets().subscribe({
      next: (data) => {
        this.tickets.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: () => {
        this.tickets.set([]);
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  ticketStatus(ticket: TicketResponseDTO): TicketStatus {
    if (ticket.used) return 'USED';
    if (ticket.expired) return 'EXPIRED';
    return 'ACTIVE';
  }

  statusBadgeClass(status: TicketStatus): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success';
      case 'USED':
        return 'bg-secondary';
      case 'EXPIRED':
        return 'bg-danger';
    }
  }
}
