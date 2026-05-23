import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoteEventModalComponent } from './promote-event-modal.component';

describe('PromoteEventModalComponent', () => {
  let component: PromoteEventModalComponent;
  let fixture: ComponentFixture<PromoteEventModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromoteEventModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PromoteEventModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
