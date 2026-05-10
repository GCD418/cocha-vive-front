import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { FacebookVerifyEmail } from './facebook-verify-email';

describe('FacebookVerifyEmail', () => {
  let component: FacebookVerifyEmail;
  let fixture: ComponentFixture<FacebookVerifyEmail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacebookVerifyEmail,  TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({}) },
            queryParamMap: of(convertToParamMap({})),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FacebookVerifyEmail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
