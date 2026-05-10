import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { EmailRegistrationModal } from './email-registration-modal';

describe('EmailRegistrationModal', () => {
  let component: EmailRegistrationModal;
  let fixture: ComponentFixture<EmailRegistrationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailRegistrationModal, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailRegistrationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
