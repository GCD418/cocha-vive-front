import { TestBed } from '@angular/core/testing';

import { PromotionEventService } from './promotion-event.service';

describe('PromotionEventService', () => {
  let service: PromotionEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PromotionEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
