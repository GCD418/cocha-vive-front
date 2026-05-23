export type PromotionPlanId = 'ONE_DAY' | 'THREE_DAYS' | 'ONE_WEEK';


export interface PromotionPlanOption {
  id: PromotionPlanId;
  price: number;
  i18nKey: string;
}

export interface BuyPromotionRequest {
  eventId: number;
  plan: PromotionPlanId;
}

export interface PromotionResponseDTO {
  id: string;
  eventId: number;
  eventTitle: string;
  plan: PromotionPlanId;
  amount: number;
  currency: string;
  startAt: string;
  endAt: string;
  createdAt: string;
}

export const PROMOTION_PLANS: readonly PromotionPlanOption[] = [
  { id: 'ONE_DAY', price: 20, i18nKey: 'ONE_DAY' },
  { id: 'THREE_DAYS', price: 50, i18nKey: 'THREE_DAYS' },
  { id: 'ONE_WEEK', price: 90, i18nKey: 'ONE_WEEK' },
] as const;