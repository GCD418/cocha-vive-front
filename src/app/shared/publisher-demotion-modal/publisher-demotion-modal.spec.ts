import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PublisherDemotionModal } from './publisher-demotion-modal';
import { RoleManagedUser } from '../../models/role-management.model';

const mockPublisher: RoleManagedUser = {
  id: 10,
  names: 'Laura',
  firstLastName: 'Gomez',
  email: 'laura.gomez@mail.com',
  role: 'ROLE_PUBLISHER',
};

describe('PublisherDemotionModalComponent', () => {
  let component: PublisherDemotionModal;

  beforeEach(() => {
    component = new PublisherDemotionModal();
    component.target = mockPublisher;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not emit confirmed when reason is blank on submit', () => {
    const spy = vi.fn();
    component.confirmed.subscribe(spy);

    component.onConfirm();

    expect(spy).not.toHaveBeenCalled();
    expect(component.submitted()).toBe(true);
    expect(component.isReasonInvalid()).toBe(true);
  });

  it('should not emit confirmed when reason is shorter than MIN_LENGTH', () => {
    const spy = vi.fn();
    component.confirmed.subscribe(spy);

    component.onReasonChange('short');
    component.onConfirm();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit confirmed with trimmed reason when reason is valid', () => {
    const spy = vi.fn();
    component.confirmed.subscribe(spy);

    const validReason = 'Publisher repeatedly violated content guidelines.';
    component.onReasonChange(validReason);
    component.onConfirm();

    expect(spy).toHaveBeenCalledWith(validReason.trim());
  });

  it('should emit cancelled when cancel is triggered and not loading', () => {
    const spy = vi.fn();
    component.cancelled.subscribe(spy);
    component.loading = false;

    component.onCancel();

    expect(spy).toHaveBeenCalled();
  });

  it('should not emit cancelled when loading is true', () => {
    const spy = vi.fn();
    component.cancelled.subscribe(spy);
    component.loading = true;

    component.onCancel();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should update charsRemaining as reason is typed', () => {
    component.onReasonChange('Hello');
    expect(component.charsRemaining()).toBe(495);
  });
});