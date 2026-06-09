import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { PublisherRequestCreatePayload } from '../../models/publisher-request.model';
import { PublisherRequestService } from '../../services/publisher-request-service/publisher-request.service';
import { ErrorBannerComponent } from '../../shared/error-banner/error-banner';

@Component({
  selector: 'app-publisher-apply-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ErrorBannerComponent],
  templateUrl: './publisher-apply-form.html',
  styleUrl: './publisher-apply-form.css',
})
export class PublisherApplyFormPageComponent {
  requestReason = signal('');
  legalEntityName = signal('');
  selectedImages = signal<File[]>([]);
  previewUrls = signal<string[]>([]);

  submitting = signal(false);
  errorMessageKey = signal<string | null>(null);

  constructor(
    private publisherRequestService: PublisherRequestService,
    private router: Router,
  ) {}

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    this.selectedImages.set(files);
    this.previewUrls.set(files.map(file => URL.createObjectURL(file)));
  }

  removeImage(index: number): void {
    const previews = this.previewUrls();
    const selectedImages = this.selectedImages();

    if (previews[index]) {
      URL.revokeObjectURL(previews[index]);
    }

    this.selectedImages.set(selectedImages.filter((_, imageIndex) => imageIndex !== index));
    this.previewUrls.set(previews.filter((_, previewIndex) => previewIndex !== index));
  }

  isFormValid(): boolean {
    return (
      this.requestReason().trim().length > 0 &&
      this.legalEntityName().trim().length > 0 &&
      this.selectedImages().length > 0
    );
  }

  onSubmit(): void {
    if (!this.isFormValid() || this.submitting()) return;

    this.submitting.set(true);
    this.errorMessageKey.set(null);

    const payload: PublisherRequestCreatePayload = {
      requestReason: this.requestReason().trim(),
      legalEntityName: this.legalEntityName().trim(),
    };

    this.publisherRequestService.createRequest(payload, this.selectedImages()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/my-publisher-request']);
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessageKey.set(this.mapErrorToMessageKey(error));
      }
    });
  }

  private mapErrorToMessageKey(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400: return 'PUBLISHER_REQUEST_FORM.ERRORS.COOLDOWN';
      case 401: return 'PUBLISHER_REQUESTS.ERRORS.UNAUTHORIZED';
      case 403: return 'PUBLISHER_REQUESTS.ERRORS.FORBIDDEN';
      case 500: return 'PUBLISHER_REQUESTS.ERRORS.SERVER';
      default:  return 'PUBLISHER_REQUESTS.ERRORS.GENERIC';
    }
  }
}
