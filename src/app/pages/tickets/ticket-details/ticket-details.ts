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

@Component({
  selector: 'app-ticket-details-page',
  imports: [CommonModule, RouterLink, TranslateModule, PricePipe, QRCodeComponent],
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

  readonly qrDataUrl = signal<string | null>(null);
  readonly qrError = signal(false);

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

    effect(() => {
      const t = this.ticket();
      if (!t || !this.canShowQr()) {
        this.qrDataUrl.set(null);
        this.qrError.set(false);
        return;
      }

      this.generateQr(t.id);
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

  private async generateQr(value: string): Promise<void> {
    this.qrError.set(false);
    try {
      const url = await QRCode.toDataURL(value, {
        margin: 1,
        width: 240,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#0e1b4d',
          light: '#ffffff',
        },
      });
      this.qrDataUrl.set(url);
    } catch {
      this.qrDataUrl.set(null);
      this.qrError.set(true);
    }
  }
}
