import { Component, signal, inject, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
export class PublisherApplyFormPageComponent implements AfterViewInit {
  requestReason = signal('');
  legalEntityName = signal('');
  selectedImages = signal<File[]>([]);
  previewUrls = signal<string[]>([]);

  submitting = signal(false);
  errorMessageKey = signal<string | null>(null);

  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly MAX_FILE_SIZE_MB = 5;
  private readonly MAX_IMAGES = 10;

  imageValidationErrors = signal<string[]>([]);

  constructor(
    private publisherRequestService: PublisherRequestService,
    private router: Router,
    private translate: TranslateService,
  ) {}

  ngAfterViewInit(): void {
    const triggers = document.querySelectorAll('[data-bs-toggle="popover"]');
    triggers.forEach(el => {
        const popover = new (window as any).bootstrap.Popover(el, {
          trigger: 'manual',
          html: true,
        });

        el.addEventListener('click', () => {
          popover.toggle();
        });

        document.addEventListener('click', (event) => {
          const target = event.target as Node;
          const popoverEl = document.querySelector('.popover');
          if (!el.contains(target) && (!popoverEl || !popoverEl.contains(target))) {
            popover.hide();
          }
        });
      });
  }

  imageTooltipContent(): string {
    const formats = this.translate.instant('PUBLISHER_REQUEST_FORM.IMAGES.TOOLTIP_FORMATS');
    const size    = this.translate.instant('PUBLISHER_REQUEST_FORM.IMAGES.TOOLTIP_SIZE');
    const max     = this.translate.instant('PUBLISHER_REQUEST_FORM.IMAGES.TOOLTIP_MAX');
    const note    = this.translate.instant('PUBLISHER_REQUEST_FORM.IMAGES.TOOLTIP_NOTE');
    return `<ul class="mb-0 ps-3 small">
      <li>${formats}</li>
      <li>${size}</li>
      <li>${max}</li>
      <li>${note}</li>
    </ul>`;
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const newFiles = Array.from(input.files);
    const errors: string[] = [];
    const valid: File[] = [];

    for (const file of newFiles) {
      if (!file.type || !this.ALLOWED_TYPES.includes(file.type) ) {
        errors.push('PUBLISHER_REQUEST_FORM.IMAGES.ERROR_TYPE');
        continue;
      }
      if (file.size > this.MAX_FILE_SIZE_MB * 1024 * 1024) {
        errors.push('PUBLISHER_REQUEST_FORM.IMAGES.ERROR_SIZE');
        continue;
      }
      valid.push(file);
    }

    const current = this.selectedImages();
    const remaining = this.MAX_IMAGES - current.length;

    if (valid.length > remaining) {
      errors.push('PUBLISHER_REQUEST_FORM.IMAGES.ERROR_MAX_COUNT');
    }
    const toAdd = valid.slice(0, remaining);

    this.imageValidationErrors.set([...new Set(errors)]);
    this.selectedImages.set([...current, ...toAdd]);
    this.previewUrls.set([
      ...this.previewUrls(),
      ...toAdd.map(file => URL.createObjectURL(file)),
    ]);

    input.value = '';
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
