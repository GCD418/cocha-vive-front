import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PublisherRequest } from '../../../models/publisher-request.model';

@Component({
  selector: 'app-publisher-request-detail',
  imports: [CommonModule, DatePipe, NgClass, TranslateModule],
  templateUrl: './publisher-request-detail.html',
  styleUrl: './publisher-request-detail.css',
})
export class PublisherRequestDetailComponent {
  @Input() request: PublisherRequest | null = null;
  @Input() loading = false;
  @Input() errorMessageKey: string | null = null;
  @Input() actionLoading = false;

  @Output() backRequested = new EventEmitter<void>();
  @Output() approveRequested = new EventEmitter<void>();
  @Output() rejectRequested = new EventEmitter<void>();

  onBack(): void {
    this.backRequested.emit();
  }

  onApprove(): void {
    this.approveRequested.emit();
  }

  onReject(): void {
    this.rejectRequested.emit();
  }

  canModerate(): boolean {
    return this.request?.requestStatus === 'PENDING' && !this.actionLoading;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'bg-warning text-dark',
      APPROVED: 'bg-success',
      REJECTED: 'bg-danger',
    };

    return classes[status] ?? 'bg-secondary';
  }

  getStatusTranslationKey(status: string): string {
    const keys: Record<string, string> = {
      PENDING: 'PUBLISHER_REQUESTS.STATUS.PENDING',
      APPROVED: 'PUBLISHER_REQUESTS.STATUS.APPROVED',
      REJECTED: 'PUBLISHER_REQUESTS.STATUS.REJECTED',
    };

    return keys[status] ?? status;
  }
}
