import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { PublisherRequest } from '../../models/publisher-request.model';
import { PublisherRequestService } from '../../services/publisher-request-service/publisher-request.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner';
import { ErrorBannerComponent } from '../../shared/error-banner/error-banner';

@Component({
  selector: 'app-my-publisher-request-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, LoadingSpinnerComponent, ErrorBannerComponent],
  templateUrl: './my-publisher-request.html',
  styleUrl: './my-publisher-request.css',
})
export class MyPublisherRequestPageComponent implements OnInit {
  request = signal<PublisherRequest | null>(null);
  loading = signal(true);
  errorMessageKey = signal<string | null>(null);

  constructor(
    private publisherRequestService: PublisherRequestService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.publisherRequestService.getMyRequest().subscribe({
      next: (request) => {
        this.request.set(request);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        if (error.status === 404) {
          this.router.navigate(['/publisher-apply-form']);
        } else {
          this.errorMessageKey.set(this.mapErrorToMessageKey(error));
        }
      }
    });
  }

  onGoToForm(): void {
    this.router.navigate(['/publisher-apply-form']);
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

  private mapErrorToMessageKey(error: HttpErrorResponse): string {
    switch (error.status) {
      case 401: return 'PUBLISHER_REQUESTS.ERRORS.UNAUTHORIZED';
      case 403: return 'PUBLISHER_REQUESTS.ERRORS.FORBIDDEN';
      case 500: return 'PUBLISHER_REQUESTS.ERRORS.SERVER';
      default:  return 'PUBLISHER_REQUESTS.ERRORS.GENERIC';
    }
  }
}