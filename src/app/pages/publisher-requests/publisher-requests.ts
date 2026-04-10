import { Component, OnInit, signal } from '@angular/core';
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
  requests = signal<PublisherRequest[]>([]);
  mode = signal<PublisherRequestFilterMode>('pending');

  loading = signal(true);
  actionLoadingId = signal<number | null>(null);

  errorMessageKey = signal<string | null>(null);
  successToastKey = signal<string | null>(null);
  errorToastKey = signal<string | null>(null);

  pendingAction = signal<{ action: ModerationAction; id: number } | null>(null);

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
    this.pendingAction.set({ action: 'approve', id });
  }

  onRejectRequested(id: number): void {
    this.pendingAction.set({ action: 'reject', id });
  }

  onActionDismissed(): void {
    this.pendingAction.set(null);
  }

  onActionConfirmed(): void {
    const pendingAction = this.pendingAction();
    if (!pendingAction) {
      return;
    }

    const { action, id } = pendingAction;
    this.actionLoadingId.set(id);

    const request$ = action === 'approve'
      ? this.publisherRequestService.approveRequest(id)
      : this.publisherRequestService.rejectRequest(id);

    request$.subscribe({
      next: () => {
        this.pendingAction.set(null);
        this.actionLoadingId.set(null);
        this.showSuccessToast(
          action === 'approve'
            ? 'PUBLISHER_REQUESTS.TOAST.APPROVE_SUCCESS'
            : 'PUBLISHER_REQUESTS.TOAST.REJECT_SUCCESS'
        );
        this.loadRequests();
      },
      error: (error: HttpErrorResponse) => {
        this.actionLoadingId.set(null);
        this.pendingAction.set(null);
        this.showErrorToast(this.mapErrorToMessageKey(error));
      }
    });
  }

  getConfirmTitleKey(): string {
    const pendingAction = this.pendingAction();
    if (!pendingAction) {
      return '';
    }

    return pendingAction.action === 'approve'
      ? 'PUBLISHER_REQUESTS.MODAL.APPROVE_TITLE'
      : 'PUBLISHER_REQUESTS.MODAL.REJECT_TITLE';
  }

  getConfirmMessageKey(): string {
    const pendingAction = this.pendingAction();
    if (!pendingAction) {
      return '';
    }

    return pendingAction.action === 'approve'
      ? 'PUBLISHER_REQUESTS.MODAL.APPROVE_MESSAGE'
      : 'PUBLISHER_REQUESTS.MODAL.REJECT_MESSAGE';
  }

  getConfirmButtonKey(): string {
    const pendingAction = this.pendingAction();
    if (!pendingAction) {
      return '';
    }

    return pendingAction.action === 'approve'
      ? 'PUBLISHER_REQUESTS.MODAL.APPROVE_BUTTON'
      : 'PUBLISHER_REQUESTS.MODAL.REJECT_BUTTON';
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
