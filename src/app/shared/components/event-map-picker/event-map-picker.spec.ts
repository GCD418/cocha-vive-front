import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventMapPicker } from './event-map-picker';

describe('EventMapPicker', () => {
  let component: EventMapPicker;
  let fixture: ComponentFixture<EventMapPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventMapPicker],
    }).compileComponents();

    fixture = TestBed.createComponent(EventMapPicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
