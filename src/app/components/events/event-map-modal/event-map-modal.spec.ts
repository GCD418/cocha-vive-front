import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventMapModal } from './event-map-modal';

describe('EventMapModal', () => {
  let component: EventMapModal;
  let fixture: ComponentFixture<EventMapModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventMapModal],
    }).compileComponents();

    fixture = TestBed.createComponent(EventMapModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
