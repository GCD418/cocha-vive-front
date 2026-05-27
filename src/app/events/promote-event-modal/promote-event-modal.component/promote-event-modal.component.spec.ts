import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { PromoteEventModalComponent } from './promote-event-modal.component';
import { PromotionEventService } from '../../../services/promotion-event/promotion-event.service';
import { PROMOTION_PLANS } from '../../../models/promotion-event.model';

describe('PromoteEventModalComponent', () => {
  let component: PromoteEventModalComponent;
  let promotionServiceSpy: { buyPromotion: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    promotionServiceSpy = {
      buyPromotion: vi.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [PromoteEventModalComponent, TranslateModule.forRoot()],
      providers: [{ provide: PromotionEventService, useValue: promotionServiceSpy }],
    }).compileComponents();

    TestBed.overrideComponent(PromoteEventModalComponent, { set: { template: '' } });

    const fixture = TestBed.createComponent(PromoteEventModalComponent);
    component = fixture.componentInstance;
    component.eventId = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start on plan step', () => {
    expect(component.step()).toBe('plan');
    expect(component.selectedPlan()).toBeNull();
  });

  it('selectPlan should move to qr step and set selected plan', () => {
    const plan = PROMOTION_PLANS[0];
    component.selectPlan(plan);

    expect(component.step()).toBe('qr');
    expect(component.selectedPlan()).toEqual(plan);
  });

  it('backToPlans should reset to plan step', () => {
    component.selectPlan(PROMOTION_PLANS[1]);
    component.backToPlans();

    expect(component.step()).toBe('plan');
    expect(component.selectedPlan()).toBeNull();
  });

  it('qrPayload should return correct string', () => {
    component.selectPlan(PROMOTION_PLANS[2]);
    expect(component.qrPayload()).toBe('PROMOTION:1:ONE_WEEK');
  });

  it('confirmPayment should call buyPromotion and emit promoted on success', () => {
    const promotedSpy = vi.fn();
    component.promoted.subscribe(promotedSpy);
    component.selectPlan(PROMOTION_PLANS[0]);

    component.confirmPayment();

    expect(promotionServiceSpy.buyPromotion).toHaveBeenCalledWith({
      eventId: 1,
      plan: 'ONE_DAY',
    });
    expect(promotedSpy).toHaveBeenCalled();
  });

  it('confirmPayment should set errorMessage on failure', () => {
    promotionServiceSpy.buyPromotion.mockReturnValue(throwError(() => new Error('error')));
    component.selectPlan(PROMOTION_PLANS[0]);

    component.confirmPayment();

    expect(component.errorMessage()).toBe(true);
    expect(component.isSubmitting()).toBe(false);
  });

  it('should not call buyPromotion if no plan selected', () => {
    component.confirmPayment();
    expect(promotionServiceSpy.buyPromotion).not.toHaveBeenCalled();
  });
});