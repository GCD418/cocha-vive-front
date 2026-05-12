import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { TranslateModule } from '@ngx-translate/core';

import { FacebookVerifyEmail } from './facebook-verify-email';
import { FacebookAuthService } from '../../services/auth/facebook-auth.service';
import { AuthService } from '../../services/auth/auth.service';

describe('FacebookVerifyEmail', () => {
  let component: FacebookVerifyEmail;
  let fixture: ComponentFixture<FacebookVerifyEmail>;

  beforeEach(async () => {
    const routerMock = { navigate: vi.fn() };

    const facebookAuthServiceMock = {
      verifyEmail: vi.fn().mockReturnValue(
        of({ internalToken: 'token', requiresOnboarding: false })
      ),
    };

    const authServiceMock = {
      initAuthFromStorage: vi.fn(),
      isLoggedIn: vi.fn().mockReturnValue(false),
      isAuthenticated: vi.fn().mockReturnValue(false),
      actualRole: null,
      getToken: vi.fn().mockReturnValue(null),
    };

    await TestBed.configureTestingModule({
      imports: [FacebookVerifyEmail, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({}) },
            queryParamMap: of(convertToParamMap({})),
          },
        },
        { provide: FacebookAuthService, useValue: facebookAuthServiceMock },
        { provide: AuthService, useValue: authServiceMock },
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
