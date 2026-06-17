import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { Navbar } from './navbar';
import { AuthService } from '../../services/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let authServiceMock: any;

  const routerMock = {
    navigate: vi.fn()
  };

  const translateServiceMock = {
    getCurrentLang: vi.fn().mockReturnValue('es'),
    use: vi.fn()
  };

  beforeEach(async () => {
    authServiceMock = {
      isAuthenticated: vi.fn().mockReturnValue(true),
      isLoggedIn: vi.fn().mockReturnValue(false),
      getCurrentUser: vi.fn().mockReturnValue(of(null)),
      logout: vi.fn(),
      getRoleFromToken: vi.fn().mockReturnValue('ROLE_USER'),
      getDecodedPayload: vi.fn().mockReturnValue({ roles: ['ROLE_USER'] }),
      getToken: vi.fn().mockReturnValue('token'),
      actualRole: vi.fn().mockReturnValue('ROLE_USER')
    };

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ login: null }))
          }
        },
        { provide: TranslateService, useValue: translateServiceMock }
      ]
    }).compileComponents();

    TestBed.overrideComponent(Navbar, {
      set: { template: '' }
    });

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle mobile menu and sync body class', () => {
    expect(component.mobileMenuOpen()).toBeFalsy();

    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBeTruthy();
    expect(document.body.classList.contains('mobile-nav-active')).toBeTruthy();

    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBeFalsy();
    expect(document.body.classList.contains('mobile-nav-active')).toBeFalsy();
  });

  it('should keep dropdowns mutually exclusive when toggling', () => {
    const fakeEvent = { stopPropagation: vi.fn() } as unknown as Event;

    component.toggleLangDropdown(fakeEvent);
    expect(component.langDropdownOpen()).toBeTruthy();
    expect(component.userDropdownOpen()).toBeFalsy();

    component.toggleUserDropdown(fakeEvent);
    expect(component.userDropdownOpen()).toBeTruthy();
    expect(component.langDropdownOpen()).toBeFalsy();
  });

  it('should derive displayName and initials from current user signal', () => {
    component.currentUser.set({
      id: 1,
      names: 'Juana',
      firstLastName: 'García',
      email: 'juana@test.com',
      role: 'ROLE_USER'
    });

    expect(component.displayName()).toBe('Juana García');
    expect(component.initials()).toBe('JG');
  });

  it('should compute publisher request visibility based on user role', () => {
    authServiceMock.getDecodedPayload.mockReturnValue({ roles: ['ROLE_USER'] });

    expect(component.canSeePublisherRequestLink()).toBeTruthy();
  });
});
