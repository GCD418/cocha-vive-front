import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

type JwtPayload = {
  requiresOnboarding?: boolean;
  roles?: unknown;
};

function parseJwtPayload(token: string): JwtPayload {
  const payloadBase64 = token.split('.')[1];
  return JSON.parse(atob(payloadBase64)) as JwtPayload;
}

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
  const token = localStorage.getItem('cocha_vive_token');

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  try {
    const decodedPayload = parseJwtPayload(token);

    const requiresOnboarding = decodedPayload.requiresOnboarding;
    const userRoles = normalizeRoles(decodedPayload.roles);
    const requiredRoles = (route.data?.['roles'] as string[] | undefined) ?? [];

    if (requiresOnboarding && state.url !== '/onboarding') {
      return router.createUrlTree(['/onboarding']);
    }

    if (!requiresOnboarding && state.url === '/onboarding') {
      return router.createUrlTree(['/home']);
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
  } catch (error) {
    localStorage.removeItem('cocha_vive_token');
    return router.createUrlTree(['/login']);
  }
};
