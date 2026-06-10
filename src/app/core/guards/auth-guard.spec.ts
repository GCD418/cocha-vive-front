import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from '../../services/auth/auth.service';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockRoute = {} as ActivatedRouteSnapshot;

  function mockState(url: string): RouterStateSnapshot {
    return { url } as RouterStateSnapshot;
  }

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isLoggedIn',
      'getDecodedPayload',
      'getToken',
      'logout',
    ]);

    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.getToken.and.returnValue('mock-token');
    authServiceSpy.getDecodedPayload.and.returnValue({
      requiresOnboarding: false,
      roles: [{ authority: 'ROLE_USER' }],
    });

    routerSpy.createUrlTree.and.callFake((commands: string[], extras?: any) => ({
      commands,
      extras,
    } as any));

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should redirect to /home with login params when user is not logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);

    executeGuard(mockRoute, mockState('/my-tickets'));

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(
      ['/home'],
      { queryParams: { login: 1, returnUrl: '/my-tickets' } }
    );
  });

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

      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(
        ['/forbidden'],
        { queryParams: { from: url } }
      );
    });
  });

  it('should block ticket routes for ROLE_PUBLISHER as well', () => {
    authServiceSpy.getDecodedPayload.and.returnValue({
      requiresOnboarding: false,
      roles: [{ authority: 'ROLE_PUBLISHER' }],
    });

    executeGuard(mockRoute, mockState('/buy-ticket/event-1'));

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(
      ['/forbidden'],
      { queryParams: { from: '/buy-ticket/event-1' } }
    );
  });

  const allowedRoutes = ['/home', '/events', '/forbidden', '/profile'];

  allowedRoutes.forEach((url) => {
    it(`should allow access to unrelated route: ${url}`, () => {
      const result = executeGuard(mockRoute, mockState(url));
      expect(result).toBeTrue();
    });
  });

  it('should redirect to /onboarding when requiresOnboarding is true', () => {
    authServiceSpy.getDecodedPayload.and.returnValue({
      requiresOnboarding: true,
      roles: [],
    });

    executeGuard(mockRoute, mockState('/home'));

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/onboarding']);
  });

  it('should redirect to /home when onboarding complete and url is /onboarding', () => {
    executeGuard(mockRoute, mockState('/onboarding'));

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/home']);
  });

  it('should redirect to /forbidden when user lacks a required role', () => {
    const routeWithRole = { data: { roles: ['ROLE_ADMIN'] } } as unknown as ActivatedRouteSnapshot;

    executeGuard(routeWithRole, mockState('/admin'));

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(
      ['/forbidden'],
      { queryParams: { from: '/admin' } }
    );
  });

  it('should allow access when user has the required role', () => {
    authServiceSpy.getDecodedPayload.and.returnValue({
      requiresOnboarding: false,
      roles: [{ authority: 'ROLE_ADMIN' }],
    });
    const routeWithRole = { data: { roles: ['ROLE_ADMIN'] } } as unknown as ActivatedRouteSnapshot;

    const result = executeGuard(routeWithRole, mockState('/admin'));

    expect(result).toBeTrue();
  });

  it('should logout and redirect to /home when decoded payload is null', () => {
    authServiceSpy.getDecodedPayload.and.returnValue(null);

    executeGuard(mockRoute, mockState('/home'));

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(
      ['/home'],
      { queryParams: { login: 1, returnUrl: '/home' } }
    );
  });

}); 