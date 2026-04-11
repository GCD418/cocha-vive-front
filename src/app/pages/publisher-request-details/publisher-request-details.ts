import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { PublisherRequest, PublisherRequestFilterMode } from '../../models/publisher-request.model';
import { PublisherRequestService } from '../../services/publisher-request-service/publisher-request.service';
import { PublisherRequestDetailComponent } from '../../components/publisher-requests/publisher-request-detail/publisher-request-detail';
import { ConfirmModalComponent } from '../../shared/confirmModal-Component/confirmModal-component';

type ModerationAction = 'approve' | 'reject';

@Component({
  selector: 'app-publisher-request-details-page',
  imports: [CommonModule, TranslateModule, PublisherRequestDetailComponent, ConfirmModalComponent],
  templateUrl: './publisher-request-details.html',
  styleUrl: './publisher-request-details.css',
})
export class PublisherRequestDetailsPageComponent implements OnInit {
  requestId: number | null = null;
  mode = signal<PublisherRequestFilterMode>('pending');
  request = signal<PublisherRequest | null>(null);

  loading = signal(true);
  actionLoading = signal(false);

  errorMessageKey = signal<string | null>(null);
  successToastKey = signal<string | null>(null);
  errorToastKey = signal<string | null>(null);

  pendingAction = signal<ModerationAction | null>(null);

  constructor(
    private publisherRequestService: PublisherRequestService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const mode = params.get('mode');
      this.mode.set(mode === 'all' ? 'all' : 'pending');
    });

    this.route.paramMap.subscribe((params) => {
      const rawId = params.get('id');
      const parsedId = Number(rawId);

      if (!rawId || Number.isNaN(parsedId) || parsedId <= 0) {
        this.loading.set(false);
        this.errorMessageKey.set('PUBLISHER_REQUESTS.ERRORS.INVALID_ID');
        return;
      }

      this.requestId = parsedId;
      this.loadRequest();
    });
  }

  onBackRequested(): void {
    this.router.navigate(['/admin/publisher-requests'], {
      queryParams: { mode: this.mode() },
    });
  }

  onApproveRequested(): void {
    this.pendingAction.set('approve');
  }

  onRejectRequested(): void {
    this.pendingAction.set('reject');
  }

  onActionDismissed(): void {
    this.pendingAction.set(null);
  }

  onActionConfirmed(): void {
    const action = this.pendingAction();
    if (!action || this.requestId === null) {
      return;
    }

    this.actionLoading.set(true);

    const request$ = action === 'approve'
      ? this.publisherRequestService.approveRequest(this.requestId)
      : this.publisherRequestService.rejectRequest(this.requestId);

    request$.subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.pendingAction.set(null);
        this.showSuccessToast(
          action === 'approve'
            ? 'PUBLISHER_REQUESTS.TOAST.APPROVE_SUCCESS'
            : 'PUBLISHER_REQUESTS.TOAST.REJECT_SUCCESS'
        );
        this.loadRequest();
      },
      error: (error: HttpErrorResponse) => {
        this.actionLoading.set(false);
        this.pendingAction.set(null);
        this.showErrorToast(this.mapErrorToMessageKey(error));
      }
    });
  }

  getConfirmTitleKey(): string {
    const action = this.pendingAction();
    if (!action) {
      return '';
    }

    return action === 'approve'
      ? 'PUBLISHER_REQUESTS.MODAL.APPROVE_TITLE'
      : 'PUBLISHER_REQUESTS.MODAL.REJECT_TITLE';
  }

  getConfirmMessageKey(): string {
    const action = this.pendingAction();
    if (!action) {
      return '';
    }

    return action === 'approve'
      ? 'PUBLISHER_REQUESTS.MODAL.APPROVE_MESSAGE'
      : 'PUBLISHER_REQUESTS.MODAL.REJECT_MESSAGE';
  }

  getConfirmButtonKey(): string {
    const action = this.pendingAction();
    if (!action) {
      return '';
    }

    return action === 'approve'
      ? 'PUBLISHER_REQUESTS.MODAL.APPROVE_BUTTON'
      : 'PUBLISHER_REQUESTS.MODAL.REJECT_BUTTON';
  }

  private loadRequest(): void {
    if (this.requestId === null) {
      return;
    }

    this.loading.set(true);
    this.errorMessageKey.set(null);

    this.publisherRequestService.getRequestById(this.requestId).subscribe({
      next: (request) => {
        this.request.set(request);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.request.set(null);
        this.loading.set(false);
        this.errorMessageKey.set(this.mapErrorToMessageKey(error));
      }
    });
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
