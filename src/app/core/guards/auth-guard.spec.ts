import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { authGuard } from './auth-guard';
import { AuthService } from '../../services/auth/auth.service';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let routerMock: any;
  let authServiceMock: any;

  const mockRoute = {} as ActivatedRouteSnapshot;

  function mockState(url: string): RouterStateSnapshot {
    return { url } as RouterStateSnapshot;
  }

  beforeEach(() => {
    routerMock = {
      createUrlTree: vi.fn().mockImplementation((commands: string[], extras?: any) => ({
        commands,
        extras,
      })),
    };

    authServiceMock = {
      isLoggedIn: vi.fn().mockReturnValue(true),
      getToken: vi.fn().mockReturnValue('mock-token'),
      getDecodedPayload: vi.fn().mockReturnValue({
        requiresOnboarding: false,
        roles: [{ authority: 'ROLE_USER' }],
      }),
      logout: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  // ─── Unauthenticated ─────────────────────────────────────────────────────────

  it('should redirect to /home with login params when user is not logged in', () => {
    authServiceMock.isLoggedIn.mockReturnValue(false);

    executeGuard(mockRoute, mockState('/my-tickets'));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(
      ['/home'],
      { queryParams: { login: 1, returnUrl: '/my-tickets' } }
    );
  });

  // ─── Blocked routes ──────────────────────────────────────────────────────────

  const blockedRoutes = [
    '/my-tickets',
    '/my-tickets/abc123',
    '/My-Tickets',
    '/MY-TICKETS/xyz',
    '/buy-ticket',
    '/buy-ticket/event-99',
    '/Buy-Ticket/123',
    '/BUY-TICKET',
  ];

  blockedRoutes.forEach((url) => {
    it(`should redirect to /forbidden for blocked route: ${url}`, () => {
      executeGuard(mockRoute, mockState(url));

      expect(routerMock.createUrlTree).toHaveBeenCalledWith(
        ['/forbidden'],
        { queryParams: { from: url } }
      );
    });
  });

  it('should block ticket routes for ROLE_PUBLISHER as well', () => {
    authServiceMock.getDecodedPayload.mockReturnValue({
      requiresOnboarding: false,
      roles: [{ authority: 'ROLE_PUBLISHER' }],
    });

    executeGuard(mockRoute, mockState('/buy-ticket/event-1'));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(
      ['/forbidden'],
      { queryParams: { from: '/buy-ticket/event-1' } }
    );
  });

  // ─── Allowed routes ──────────────────────────────────────────────────────────

  const allowedRoutes = ['/home', '/events', '/forbidden', '/profile'];

  allowedRoutes.forEach((url) => {
    it(`should allow access to unrelated route: ${url}`, () => {
      const result = executeGuard(mockRoute, mockState(url));

      expect(result).toBe(true);
    });
  });

  // ─── Onboarding ──────────────────────────────────────────────────────────────

  it('should redirect to /onboarding when requiresOnboarding is true', () => {
    authServiceMock.getDecodedPayload.mockReturnValue({
      requiresOnboarding: true,
      roles: [],
    });

    executeGuard(mockRoute, mockState('/home'));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/onboarding']);
  });

  it('should redirect to /home when onboarding complete and url is /onboarding', () => {
    executeGuard(mockRoute, mockState('/onboarding'));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/home']);
  });

  // ─── Role-based authorization ─────────────────────────────────────────────────

  it('should redirect to /forbidden when user lacks a required role', () => {
    const routeWithRole = { data: { roles: ['ROLE_ADMIN'] } } as unknown as ActivatedRouteSnapshot;

    executeGuard(routeWithRole, mockState('/admin'));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(
      ['/forbidden'],
      { queryParams: { from: '/admin' } }
    );
  });

  it('should allow access when user has the required role', () => {
    authServiceMock.getDecodedPayload.mockReturnValue({
      requiresOnboarding: false,
      roles: [{ authority: 'ROLE_ADMIN' }],
    });
    const routeWithRole = { data: { roles: ['ROLE_ADMIN'] } } as unknown as ActivatedRouteSnapshot;

    const result = executeGuard(routeWithRole, mockState('/admin'));

    expect(result).toBe(true);
  });

  // ─── Token / payload edge cases ───────────────────────────────────────────────

  it('should logout and redirect to /home when decoded payload is null', () => {
    authServiceMock.getDecodedPayload.mockReturnValue(null);

    executeGuard(mockRoute, mockState('/home'));

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(
      ['/home'],
      { queryParams: { login: 1, returnUrl: '/home' } }
    );
  });

});