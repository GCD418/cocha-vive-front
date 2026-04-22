import { Component, EventEmitter, Input, Output, signal  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reject-reason-modal',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './reject-reason-modal.html',
  styleUrl: './reject-reason-modal.css',
})
export class RejectReasonModalComnponente {
  @Input() title = '';
  @Input() loading = false;
  @Output() confirmed = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  readonly MAX_LENGTH = 500;
  readonly MIN_LENGTH = 10;

  rejectionReason = signal('');

  get isValid(): boolean {
    const val = this.rejectionReason().trim();
    return val.length >= this.MIN_LENGTH && val.length <= this.MAX_LENGTH;
  }

  get remainingChars(): number {
    return this.MAX_LENGTH - this.rejectionReason().length;
  }

  onConfirm(): void {
    if (!this.isValid || this.loading) return;
    this.confirmed.emit(this.rejectionReason().trim());
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
