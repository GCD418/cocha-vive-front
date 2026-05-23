import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { PromotionEventService } from '../../../services/promotion-event/promotion-event.service';
import {
  PROMOTION_PLANS,
  PromotionPlanOption,
} from '../../../models/promotion-event.model';

declare const bootstrap: any;

@Component({
  selector: 'app-promote-event-modal.component',
  imports: [CommonModule, TranslateModule, QRCodeComponent],
  templateUrl: './promote-event-modal.component.html',
  styleUrl: './promote-event-modal.component.css',
})
export class PromoteEventModalComponent {
  @Input({ required: true }) eventId!: number;

  /** Emitted after a successful purchase, so the parent can refresh. */
  @Output() promoted = new EventEmitter<void>();

  readonly plans = PROMOTION_PLANS;

  /** Current modal step: choosing a plan, or showing the payment QR. */
  readonly step = signal<'plan' | 'qr'>('plan');
  readonly selectedPlan = signal<PromotionPlanOption | null>(null);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal(false);

  private modalRef: any = null;

  constructor(private promotionEventService: PromotionEventService) {}

  open(): void {
    this.resetState();
    const element = document.getElementById('promoteEventModal');
    if (element) {
      this.modalRef = bootstrap.Modal.getOrCreateInstance(element);
      this.modalRef.show();
    }
  }

  selectPlan(plan: PromotionPlanOption): void {
    this.selectedPlan.set(plan);
    this.step.set('qr');
  }

  backToPlans(): void {
    this.step.set('plan');
    this.selectedPlan.set(null);
  }

  qrPayload(): string {
    const plan = this.selectedPlan();
    return plan ? `PROMOTION:${this.eventId}:${plan.id}` : '';
  }

  confirmPayment(): void {
    const plan = this.selectedPlan();
    if (!plan || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(false);

    this.promotionEventService
      .buyPromotion({ eventId: this.eventId, plan: plan.id })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.modalRef?.hide();
          this.promoted.emit();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.errorMessage.set(true);
        },
      });
  }

  private resetState(): void {
    this.step.set('plan');
    this.selectedPlan.set(null);
    this.isSubmitting.set(false);
    this.errorMessage.set(false);
  }
}
