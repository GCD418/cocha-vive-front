import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { map } from 'rxjs';
import { QRCodeComponent } from 'angularx-qrcode';
import { toSignal } from '@angular/core/rxjs-interop';
import { TicketResponseDTO } from '../../../models/ticket.model';
import { TicketService } from '../../../services/ticket-service/ticket.service';
import { PricePipe } from '../../../shared/pipes/price.pipe';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner';
import { ErrorBannerComponent } from '../../../shared/error-banner/error-banner';

@Component({
  selector: 'app-ticket-details-page',
  imports: [CommonModule, RouterLink, TranslateModule, PricePipe, QRCodeComponent, LoadingSpinnerComponent, ErrorBannerComponent],
  templateUrl: './ticket-details.html',
  styleUrl: './ticket-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ticketService = inject(TicketService);

  readonly loading = signal(false);
  readonly error = signal(false);
  readonly ticket = signal<TicketResponseDTO | null>(null);

  private readonly ticketId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null }
  );

  readonly canShowQr = computed(() => {
    const t = this.ticket();
    return Boolean(t && !t.used && !t.expired);
  });

  constructor() {
    effect(() => {
      const id = this.ticketId();
      if (!id) return;
      this.loadTicket(id);
    });
  }

  goBack(): void {
    this.router.navigate(['/my-tickets']);
  }

  private loadTicket(id: string): void {
    this.loading.set(true);
    this.error.set(false);
    this.ticket.set(null);

    this.ticketService.getMyTickets().subscribe({
      next: (tickets) => {
        const found = (tickets ?? []).find((t) => t.id === id) ?? null;
        this.ticket.set(found);
        this.loading.set(false);
        this.error.set(!found);
      },
      error: () => {
        this.ticket.set(null);
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }


}
