import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PublisherApplyFormPageComponent } from './publisher-apply-form';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('PublisherApplyFormPageComponent', () => {
  let component: PublisherApplyFormPageComponent;
  let publisherRequestServiceMock: any;
  let routerMock: any;
  let translateMock: any;

  beforeEach(() => {
    publisherRequestServiceMock = {
      createRequest: vi.fn().mockReturnValue(of({})),
    };
    routerMock = {
      navigate: vi.fn(),
    };
    translateMock = {
      instant: vi.fn((key: string) => key),
    };

    component = new PublisherApplyFormPageComponent(
      publisherRequestServiceMock,
      routerMock,
      translateMock,
    );
  });

  describe('isFormValid', () => {
    it('should return false when all fields are empty', () => {
      expect(component.isFormValid()).toBe(false);
    });

    it('should return false when images are missing', () => {
      component.requestReason.set('Valid reason');
      component.legalEntityName.set('Legal SRL');
      expect(component.isFormValid()).toBe(false);
    });

    it('should return false when reason is missing', () => {
      component.legalEntityName.set('Legal SRL');
      component.selectedImages.set([new File([''], 'img.jpg', { type: 'image/jpeg' })]);
      expect(component.isFormValid()).toBe(false);
    });

    it('should return true when all required fields are filled', () => {
      component.requestReason.set('Valid reason');
      component.legalEntityName.set('Legal SRL');
      component.selectedImages.set([new File([''], 'img.jpg', { type: 'image/jpeg' })]);
      expect(component.isFormValid()).toBe(true);
    });
  });

  describe('onImagesSelected', () => {
    const makeEvent = (files: File[]): Event => {
      const input = { files, value: '' } as any;
      return { target: input } as any;
    };

    it('should accept valid jpeg, png and webp files', () => {
      const files = [
        new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
        new File(['b'], 'b.png', { type: 'image/png' }),
        new File(['c'], 'c.webp', { type: 'image/webp' }),
      ];
      component.onImagesSelected(makeEvent(files));
      expect(component.selectedImages().length).toBe(3);
      expect(component.imageValidationErrors().length).toBe(0);
    });

    it('should reject files with unsupported type', () => {
      const files = [
        new File(['a'], 'a.gif', { type: 'image/gif' }),
        new File(['b'], 'b.heic', { type: 'image/heic' }),
      ];
      component.onImagesSelected(makeEvent(files));
      expect(component.selectedImages().length).toBe(0);
      expect(component.imageValidationErrors()).toContain(
        'PUBLISHER_REQUEST_FORM.IMAGES.ERROR_TYPE',
      );
    });

    it('should reject files with empty MIME type', () => {
      const files = [new File(['a'], 'a.heic', { type: '' })];
      component.onImagesSelected(makeEvent(files));
      expect(component.selectedImages().length).toBe(0);
      expect(component.imageValidationErrors()).toContain(
        'PUBLISHER_REQUEST_FORM.IMAGES.ERROR_TYPE',
      );
    });

    it('should reject files exceeding 5MB', () => {
      const bigFile = new File([new Uint8Array(6 * 1024 * 1024)], 'big.jpg', {
        type: 'image/jpeg',
      });
      component.onImagesSelected(makeEvent([bigFile]));
      expect(component.selectedImages().length).toBe(0);
      expect(component.imageValidationErrors()).toContain(
        'PUBLISHER_REQUEST_FORM.IMAGES.ERROR_SIZE',
      );
    });

    it('should accumulate images across multiple selections', () => {
      const first = [new File(['a'], 'a.jpg', { type: 'image/jpeg' })];
      const second = [new File(['b'], 'b.png', { type: 'image/png' })];
      component.onImagesSelected(makeEvent(first));
      component.onImagesSelected(makeEvent(second));
      expect(component.selectedImages().length).toBe(2);
    });

    it('should not exceed 10 images and should set ERROR_MAX_COUNT', () => {
      const batch = Array.from({ length: 8 }, (_, i) =>
        new File(['x'], `img${i}.jpg`, { type: 'image/jpeg' }),
      );
      component.onImagesSelected(makeEvent(batch));

      const overflow = Array.from({ length: 5 }, (_, i) =>
        new File(['x'], `extra${i}.jpg`, { type: 'image/jpeg' }),
      );
      component.onImagesSelected(makeEvent(overflow));

      expect(component.selectedImages().length).toBe(10);
      expect(component.imageValidationErrors()).toContain(
        'PUBLISHER_REQUEST_FORM.IMAGES.ERROR_MAX_COUNT',
      );
    });

    it('should deduplicate error keys when multiple files fail', () => {
      const files = [
        new File(['a'], 'a.gif', { type: 'image/gif' }),
        new File(['b'], 'b.bmp', { type: 'image/bmp' }),
      ];
      component.onImagesSelected(makeEvent(files));
      const typeErrors = component.imageValidationErrors().filter(
        k => k === 'PUBLISHER_REQUEST_FORM.IMAGES.ERROR_TYPE',
      );
      expect(typeErrors.length).toBe(1);
    });
  });


  describe('removeImage', () => {
    beforeEach(() => {
      component.selectedImages.set([
        new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
        new File(['b'], 'b.png', { type: 'image/png' }),
      ]);
      component.previewUrls.set(['blob://a', 'blob://b']);
    });

    it('should remove the image at the given index', () => {
      component.removeImage(0);
      expect(component.selectedImages().length).toBe(1);
      expect(component.previewUrls().length).toBe(1);
    });

    it('should remove the correct image by index', () => {
      const remaining = component.selectedImages()[1];
      component.removeImage(0);
      expect(component.selectedImages()[0]).toBe(remaining);
    });
  });


  describe('onSubmit', () => {
    beforeEach(() => {
      component.requestReason.set('Valid reason');
      component.legalEntityName.set('Legal SRL');
      component.selectedImages.set([new File(['a'], 'a.jpg', { type: 'image/jpeg' })]);
    });

    it('should call createRequest with trimmed values', () => {
      component.requestReason.set('  reason with spaces  ');
      component.legalEntityName.set('  Legal SRL  ');
      component.onSubmit();
      expect(publisherRequestServiceMock.createRequest).toHaveBeenCalledWith(
        { requestReason: 'reason with spaces', legalEntityName: 'Legal SRL' },
        expect.any(Array),
      );
    });

    it('should navigate to /my-publisher-request on success', () => {
      component.onSubmit();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/my-publisher-request']);
    });

    it('should not submit when form is invalid', () => {
      component.requestReason.set('');
      component.onSubmit();
      expect(publisherRequestServiceMock.createRequest).not.toHaveBeenCalled();
    });

    it('should set error key on 400 response', () => {
      publisherRequestServiceMock.createRequest.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 400 })),
      );
      component.onSubmit();
      expect(component.errorMessageKey()).toBe('PUBLISHER_REQUEST_FORM.ERRORS.COOLDOWN');
    });

    it('should set error key on 500 response', () => {
      publisherRequestServiceMock.createRequest.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 500 })),
      );
      component.onSubmit();
      expect(component.errorMessageKey()).toBe('PUBLISHER_REQUESTS.ERRORS.SERVER');
    });

    it('should reset submitting to false after error', () => {
      publisherRequestServiceMock.createRequest.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 500 })),
      );
      component.onSubmit();
      expect(component.submitting()).toBe(false);
    });
  });
});