import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

function normalizeRoles(rawRoles: unknown): string[] {
  if (!Array.isArray(rawRoles)) {
    return [];
  }

  return rawRoles
    .map((role) => {
      if (typeof role === 'string') {
        return role;
      }

      if (
        role !== null &&
        typeof role === 'object' &&
        'authority' in role &&
        typeof (role as { authority?: unknown }).authority === 'string'
      ) {
        return (role as { authority: string }).authority;
      }

      return null;
    })
    .filter((role): role is string => Boolean(role));
}

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/home'], {
      queryParams: { login: 1, returnUrl: state.url },
    });
  }

  const decodedPayload = authService.getDecodedPayload(authService.getToken());
  if (!decodedPayload) {
    authService.logout();
    return router.createUrlTree(['/home'], {
      queryParams: { login: 1, returnUrl: state.url },
    });
  }

  const requiresOnboarding = Boolean(decodedPayload.requiresOnboarding);
  const userRoles = normalizeRoles(decodedPayload.roles);
  const requiredRoles = (route.data?.['roles'] as string[] | undefined) ?? [];

  if (requiresOnboarding && state.url !== '/onboarding') {
    return router.createUrlTree(['/onboarding']);
  }

  if (!requiresOnboarding && state.url === '/onboarding') {
    return router.createUrlTree(['/home']);
  }

  if (!userRoles.includes('ROLE_PUBLISHER') && state.url === '/events/create') {
    return router.createUrlTree(['/publisher-apply-form'], {
      queryParams: { from: state.url },
    });
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      return router.createUrlTree(['/forbidden'], {
        queryParams: { from: state.url },
      });
    }
  }

  return true;
};
