import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { RejectReasonModalComponent } from './reject-reason-modal';

describe('RejectReasonModalComponent', () => {
  let component: RejectReasonModalComponent;
  let fixture: ComponentFixture<RejectReasonModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectReasonModalComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(RejectReasonModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
