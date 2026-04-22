import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { PublisherRequest, PublisherRequestFilterMode } from '../../models/publisher-request.model';
import { PublisherRequestService } from '../../services/publisher-request-service/publisher-request.service';
import { PublisherRequestsTableComponent } from '../../components/publisher-requests/publisher-requests-table/publisher-requests-table';
import { ConfirmModalComponent } from '../../shared/confirmModal-Component/confirmModal-component';
import { RejectReasonModalComnponent } from '../../shared/reject-reason-modal/reject-reason-modal';

type ModerationAction = 'approve' | 'reject';

@Component({
  selector: 'app-publisher-requests-page',
  imports: [CommonModule, TranslateModule, PublisherRequestsTableComponent, ConfirmModalComponent, RejectReasonModalComnponent],
  templateUrl: './publisher-requests.html',
  styleUrl: './publisher-requests.css',
})
export class PublisherRequestsPageComponent implements OnInit {
  requests = signal<PublisherRequest[]>([]);
  mode = signal<PublisherRequestFilterMode>('pending');

  loading = signal(true);
  actionLoadingId = signal<number | null>(null);

  errorMessageKey = signal<string | null>(null);
  successToastKey = signal<string | null>(null);
  errorToastKey = signal<string | null>(null);

  pendingApproveId = signal<number | null>(null);
  pendingRejectId = signal<number | null>(null);

  constructor(
    private publisherRequestService: PublisherRequestService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const mode = params.get('mode');
      this.mode.set(mode === 'all' ? 'all' : 'pending');
      this.loadRequests();
    });
  }

  onModeChanged(mode: PublisherRequestFilterMode): void {
    if (mode === this.mode()) {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode },
      queryParamsHandling: 'merge',
    });
  }

  onViewRequested(id: number): void {
    this.router.navigate(['/admin/publisher-requests', id], {
      queryParams: { mode: this.mode() },
    });
  }

  onApproveRequested(id: number): void {
    this.pendingApproveId.set(id);
  }

  onRejectRequested(id: number): void {
    this.pendingRejectId.set(id);
  }

  onApproveDismissed(): void {
    this.pendingApproveId.set(null);
  }

  onRejectDismissed(): void {
    this.pendingRejectId.set(null);
  }

  onApproveConfirmed(): void {
    const id = this.pendingApproveId();
    if (id === null) return;

    this.actionLoadingId.set(id);
    this.publisherRequestService.approveRequest(id).subscribe({
      next: () => {
        this.pendingApproveId.set(null);
        this.actionLoadingId.set(null);
        this.showSuccessToast('PUBLISHER_REQUESTS.TOAST.APPROVE_SUCCESS');
        this.loadRequests();
      },
      error: (error: HttpErrorResponse) => {
        this.actionLoadingId.set(null);
        this.pendingApproveId.set(null);
        this.showErrorToast(this.mapErrorToMessageKey(error));
      }
    });
  }

  onRejectConfirmed(rejectionReason: string): void {
    const id = this.pendingRejectId();
    if (id === null) return;

    this.actionLoadingId.set(id);
    this.publisherRequestService.rejectRequest(id, { rejectionReason }).subscribe({
      next: () => {
        this.pendingRejectId.set(null);
        this.actionLoadingId.set(null);
        this.showSuccessToast('PUBLISHER_REQUESTS.TOAST.REJECT_SUCCESS');
        this.loadRequests();
      },
      error: (error: HttpErrorResponse) => {
        this.actionLoadingId.set(null);
        this.pendingRejectId.set(null);
        this.showErrorToast(this.mapErrorToMessageKey(error));
      }
    });
  }

  getConfirmTitleKey(): string {
    return 'PUBLISHER_REQUESTS.MODAL.APPROVE_TITLE';
  }

  getConfirmMessageKey(): string {
    return 'PUBLISHER_REQUESTS.MODAL.APPROVE_MESSAGE';
  }

  getConfirmButtonKey(): string {
    return 'PUBLISHER_REQUESTS.MODAL.APPROVE_BUTTON';
  }

  private loadRequests(): void {
    this.loading.set(true);
    this.errorMessageKey.set(null);

    const request$ = this.mode() === 'all'
      ? this.publisherRequestService.getAllRequests()
      : this.publisherRequestService.getPendingRequests();

    request$.subscribe({
      next: (requests) => {
        this.requests.set(this.sortOldestFirst(requests));
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.requests.set([]);
        this.loading.set(false);
        this.errorMessageKey.set(this.mapErrorToMessageKey(error));
      }
    });
  }

  private sortOldestFirst(requests: PublisherRequest[]): PublisherRequest[] {
    return [...requests].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  private mapErrorToMessageKey(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400: 
      return 'PUBLISHER_REQUESTS.ERRORS.VALIDATION';
      case 401:
        return 'PUBLISHER_REQUESTS.ERRORS.UNAUTHORIZED';
      case 403:
        return 'PUBLISHER_REQUESTS.ERRORS.FORBIDDEN';
      case 404:
        return 'PUBLISHER_REQUESTS.ERRORS.NOT_FOUND';
      case 409: 
        return 'PUBLISHER_REQUESTS.ERRORS.INVALID_STATE';
      case 500:
        return 'PUBLISHER_REQUESTS.ERRORS.SERVER';
      default:
        return 'PUBLISHER_REQUESTS.ERRORS.GENERIC';
    }
  }

  private showSuccessToast(messageKey: string): void {
    this.successToastKey.set(messageKey);
    setTimeout(() => {
      this.successToastKey.set(null);
    }, 2500);
  }

  private showErrorToast(messageKey: string): void {
    this.errorToastKey.set(messageKey);
    setTimeout(() => {
      this.errorToastKey.set(null);
    }, 3500);
  }
}
