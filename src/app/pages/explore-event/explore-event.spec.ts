import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreEvent } from './explore-event';

describe('ExploreEvent', () => {
  let component: ExploreEvent;
  let fixture: ComponentFixture<ExploreEvent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreEvent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExploreEvent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
