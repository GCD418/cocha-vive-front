import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingEventsListComponent } from './upcoming-events-list-component';

describe('UpcomingEventsListComponent', () => {
  let component: UpcomingEventsListComponent;
  let fixture: ComponentFixture<UpcomingEventsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingEventsListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingEventsListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
