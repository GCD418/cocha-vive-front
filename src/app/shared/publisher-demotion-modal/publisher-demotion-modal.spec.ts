import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublisherDemotionModal } from './publisher-demotion-modal';

describe('PublisherDemotionModal', () => {
  let component: PublisherDemotionModal;
  let fixture: ComponentFixture<PublisherDemotionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublisherDemotionModal],
    }).compileComponents();

    fixture = TestBed.createComponent(PublisherDemotionModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
