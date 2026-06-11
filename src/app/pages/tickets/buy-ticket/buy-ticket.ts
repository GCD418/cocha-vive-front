import { Component, effect, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EventService } from '../../../services/event-service/event.service';
import { TicketService } from '../../../services/ticket-service/ticket.service';
import { EventModel } from '../../../models/event-model';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PricePipe } from '../../../shared/pipes/price.pipe';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-buy-ticket',
  imports: [CommonModule, TranslateModule, FormsModule, PricePipe, LoadingSpinnerComponent],
  templateUrl: './buy-ticket.html',
  styleUrl: './buy-ticket.css'
})
export class BuyTicketPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private ticketService = inject(TicketService);

  event = signal<EventModel | null>(null);
  quantity = signal<number>(1);
  isSubmitting = signal<boolean>(false);

  eventId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('eventId')))),
    { initialValue: 0 }
  );

  totalPrice = computed(() => {
    const ev = this.event();
    return ev ? ev.cost * this.quantity() : 0;
  });

  constructor() {
    effect(() => {
      const id = this.eventId();
      if (id) {
        this.eventService.getEventById(id).subscribe(data => {
          this.event.set(data);
        });
      }
    });
  }

  increment() {
    if (this.quantity() < 20) {
      this.quantity.update(q => q + 1);
    }
  }

  decrement() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  confirmPurchase() {
    const id = this.eventId();
    if (!id || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.ticketService.buyTickets({ eventId: id, quantity: this.quantity() }).subscribe({
      next: () => {
        this.router.navigate(['/my-tickets']);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  goBack() {
    const id = this.eventId();
    if (id) {
      this.router.navigate(['/event-details', id]);
    } else {
      this.router.navigate(['/explore-events']);
    }
  }
}
