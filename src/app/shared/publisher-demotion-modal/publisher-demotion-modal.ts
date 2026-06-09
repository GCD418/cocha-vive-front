import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RoleManagedUser } from '../../models/role-management.model';
import { FocusTrapDirective } from '../focus-trap.directive';


@Component({
  selector: 'app-publisher-demotion-modal',
  imports: [CommonModule, FormsModule, TranslateModule, FocusTrapDirective],
  templateUrl: './publisher-demotion-modal.html',
  styleUrl: './publisher-demotion-modal.css',
})
export class PublisherDemotionModal {
  @Input() target!: RoleManagedUser;
  @Input() loading = false;
  @Output() confirmed = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  readonly MIN_LENGTH = 10;
  readonly MAX_LENGTH = 500;

  demotionReason = signal('');
  submitted = signal(false);

  isReasonInvalid = computed(() => {
    const reason = this.demotionReason().trim();
    return reason.length < this.MIN_LENGTH || reason.length > this.MAX_LENGTH;
  });

  charsRemaining = computed(() =>
    this.MAX_LENGTH - this.demotionReason().length
  );

  onReasonChange(value: string): void {
    this.demotionReason.set(value);
  }

  onConfirm(): void {
    this.submitted.set(true);
    if (this.isReasonInvalid()) return;
    this.confirmed.emit(this.demotionReason().trim());
  }

  onCancel(): void {
    if (this.loading) return;
    this.cancelled.emit();
  }
}
