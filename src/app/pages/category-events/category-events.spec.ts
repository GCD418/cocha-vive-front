import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryEvents } from './category-events';

describe('CategoryEvents', () => {
  let component: CategoryEvents;
  let fixture: ComponentFixture<CategoryEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryEvents],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryEvents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
