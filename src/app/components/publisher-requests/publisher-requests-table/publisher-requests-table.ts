import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PublisherRequest, PublisherRequestFilterMode } from '../../../models/publisher-request.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner';
import { ErrorBannerComponent } from '../../../shared/error-banner/error-banner';

@Component({
  selector: 'app-publisher-requests-table',
  imports: [CommonModule, DatePipe, NgClass, TranslateModule, LoadingSpinnerComponent, ErrorBannerComponent],
  templateUrl: './publisher-requests-table.html',
  styleUrl: './publisher-requests-table.css',
})
export class PublisherRequestsTableComponent {
  @Input() requests: PublisherRequest[] = [];
  @Input() loading = false;
  @Input() errorMessageKey: string | null = null;
  @Input() mode: PublisherRequestFilterMode = 'pending';
  @Input() actionLoadingId: number | null = null;

  @Output() modeChanged = new EventEmitter<PublisherRequestFilterMode>();
  @Output() viewRequested = new EventEmitter<number>();
  @Output() approveRequested = new EventEmitter<number>();
  @Output() rejectRequested = new EventEmitter<number>();

  onChangeMode(mode: PublisherRequestFilterMode): void {
    this.modeChanged.emit(mode);
  }

  onView(id: number): void {
    this.viewRequested.emit(id);
  }

  onApprove(id: number): void {
    this.approveRequested.emit(id);
  }

  onReject(id: number): void {
    this.rejectRequested.emit(id);
  }

  canModerate(request: PublisherRequest): boolean {
    return request.requestStatus === 'PENDING';
  }

  getCreatorFullName(request: PublisherRequest): string {
    const names = [
      request.createdByUser.names,
      request.createdByUser.firstLastName,
      request.createdByUser.secondLastName,
    ].filter((part): part is string => Boolean(part && part.trim()));

    return names.join(' ');
  }

  getCreatorInitials(request: PublisherRequest): string {
    const first = request.createdByUser.names?.charAt(0) ?? '';
    const last = request.createdByUser.firstLastName?.charAt(0) ?? '';
    return `${first}${last}`.toUpperCase();
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

  countByStatus(status: string): number {
    return this.requests.filter((request) => request.requestStatus === status).length;
  }

  trackById(_index: number, request: PublisherRequest): number {
    return request.id;
  }
}
