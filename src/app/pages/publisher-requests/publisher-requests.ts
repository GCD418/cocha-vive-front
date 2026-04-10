import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { PublisherRequest, PublisherRequestFilterMode } from '../../models/publisher-request.model';
import { PublisherRequestService } from '../../services/publisher-request-service/publisher-request.service';
import { PublisherRequestsTableComponent } from '../../components/publisher-requests/publisher-requests-table/publisher-requests-table';
import { ConfirmModalComponent } from '../../shared/confirmModal-Component/confirmModal-component';

type ModerationAction = 'approve' | 'reject';

@Component({
  selector: 'app-publisher-requests-page',
  imports: [CommonModule, TranslateModule, PublisherRequestsTableComponent, ConfirmModalComponent],
  templateUrl: './publisher-requests.html',
  styleUrl: './publisher-requests.css',
})
export class PublisherRequestsPageComponent implements OnInit {
  requests: PublisherRequest[] = [];
  mode: PublisherRequestFilterMode = 'pending';

  loading = true;
  actionLoadingId: number | null = null;

  errorMessageKey: string | null = null;
  successToastKey: string | null = null;
  errorToastKey: string | null = null;

  pendingAction: { action: ModerationAction; id: number } | null = null;

  constructor(
    private publisherRequestService: PublisherRequestService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const mode = params.get('mode');
      this.mode = mode === 'all' ? 'all' : 'pending';
      this.loadRequests();
    });
  }

  onModeChanged(mode: PublisherRequestFilterMode): void {
    if (mode === this.mode) {
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
      queryParams: { mode: this.mode },
    });
  }

  onApproveRequested(id: number): void {
    this.pendingAction = { action: 'approve', id };
  }

  onRejectRequested(id: number): void {
    this.pendingAction = { action: 'reject', id };
  }

  onActionDismissed(): void {
    this.pendingAction = null;
  }

  onActionConfirmed(): void {
    if (!this.pendingAction) {
      return;
    }

    const { action, id } = this.pendingAction;
    this.actionLoadingId = id;

    const request$ = action === 'approve'
      ? this.publisherRequestService.approveRequest(id)
      : this.publisherRequestService.rejectRequest(id);

    request$.subscribe({
      next: () => {
        this.pendingAction = null;
        this.actionLoadingId = null;
        this.showSuccessToast(
          action === 'approve'
            ? 'PUBLISHER_REQUESTS.TOAST.APPROVE_SUCCESS'
            : 'PUBLISHER_REQUESTS.TOAST.REJECT_SUCCESS'
        );
        this.loadRequests();
      },
      error: (error: HttpErrorResponse) => {
        this.actionLoadingId = null;
        this.pendingAction = null;
        this.showErrorToast(this.mapErrorToMessageKey(error));
      }
    });
  }

  getConfirmTitleKey(): string {
    if (!this.pendingAction) {
      return '';
    }

    return this.pendingAction.action === 'approve'
      ? 'PUBLISHER_REQUESTS.MODAL.APPROVE_TITLE'
      : 'PUBLISHER_REQUESTS.MODAL.REJECT_TITLE';
  }

  getConfirmMessageKey(): string {
    if (!this.pendingAction) {
      return '';
    }

    return this.pendingAction.action === 'approve'
      ? 'PUBLISHER_REQUESTS.MODAL.APPROVE_MESSAGE'
      : 'PUBLISHER_REQUESTS.MODAL.REJECT_MESSAGE';
  }

  getConfirmButtonKey(): string {
    if (!this.pendingAction) {
      return '';
    }

    return this.pendingAction.action === 'approve'
      ? 'PUBLISHER_REQUESTS.MODAL.APPROVE_BUTTON'
      : 'PUBLISHER_REQUESTS.MODAL.REJECT_BUTTON';
  }

  private loadRequests(): void {
    this.loading = true;
    this.errorMessageKey = null;

    const request$ = this.mode === 'all'
      ? this.publisherRequestService.getAllRequests()
      : this.publisherRequestService.getPendingRequests();

    request$.subscribe({
      next: (requests) => {
        this.requests = this.sortOldestFirst(requests);
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.requests = [];
        this.loading = false;
        this.errorMessageKey = this.mapErrorToMessageKey(error);
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
      case 401:
        return 'PUBLISHER_REQUESTS.ERRORS.UNAUTHORIZED';
      case 403:
        return 'PUBLISHER_REQUESTS.ERRORS.FORBIDDEN';
      case 404:
        return 'PUBLISHER_REQUESTS.ERRORS.NOT_FOUND';
      case 500:
        return 'PUBLISHER_REQUESTS.ERRORS.SERVER';
      default:
        return 'PUBLISHER_REQUESTS.ERRORS.GENERIC';
    }
  }

  private showSuccessToast(messageKey: string): void {
    this.successToastKey = messageKey;
    setTimeout(() => {
      this.successToastKey = null;
    }, 2500);
  }

  private showErrorToast(messageKey: string): void {
    this.errorToastKey = messageKey;
    setTimeout(() => {
      this.errorToastKey = null;
    }, 3500);
  }
}
