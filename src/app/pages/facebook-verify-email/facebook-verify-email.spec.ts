import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacebookVerifyEmail } from './facebook-verify-email';

describe('FacebookVerifyEmail', () => {
  let component: FacebookVerifyEmail;
  let fixture: ComponentFixture<FacebookVerifyEmail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacebookVerifyEmail],
    }).compileComponents();

    fixture = TestBed.createComponent(FacebookVerifyEmail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
