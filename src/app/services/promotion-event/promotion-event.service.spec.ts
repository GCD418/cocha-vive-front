import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PromotionEventService } from './promotion-event.service';
import { BuyPromotionRequest, PromotionResponseDTO } from '../../models/promotion-event.model';
import { environment } from '../../../environments/environment';

describe('PromotionService', () => {
  let service: PromotionEventService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PromotionEventService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PromotionEventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should POST to /promotions/buy and return PromotionResponseDTO', () => {
    const request: BuyPromotionRequest = { eventId: 1, plan: 'ONE_WEEK' };
    const mockResponse: PromotionResponseDTO = {
      id: 'abc-123',
      eventId: 1,
      eventTitle: 'Concierto',
      plan: 'ONE_WEEK',
      amount: 90,
      currency: 'BOB',
      startAt: '2026-05-23T00:00:00',
      endAt: '2026-05-30T00:00:00',
      createdAt: '2026-05-23T00:00:00',
    };

    service.buyPromotion(request).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/promotions/buy`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockResponse);
  });
});