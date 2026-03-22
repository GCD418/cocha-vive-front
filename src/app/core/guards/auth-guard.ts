import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('cocha_vive_token');

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  try {
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));

    const requiresOnboarding = decodedPayload.requires_onboarding;

    if (requiresOnboarding && state.url !== '/onboarding') {
      return router.createUrlTree(['/onboarding']);
    }

    if(!requiresOnboarding && state.url === '/onboarding') {
      return router.createUrlTree(['/home']);
    }

    return true;
  } catch (error) {
    localStorage.removeItem('cocha_vive_token');
    return router.createUrlTree(['/login']);
  }
};
