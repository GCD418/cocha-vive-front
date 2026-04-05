import { CanActivateFn, Router } from '@angular/router';
import { AppFeatureKey } from '../../models/app-features';
import { FeatureToggleService } from '../../services/feature-toggle/feature-toggle.service';
import { inject } from '@angular/core';

export const requireFeature = (feature: AppFeatureKey): CanActivateFn => {
  return () => {
    const featureToggleService = inject(FeatureToggleService);
    const router = inject(Router);
    
    if (featureToggleService.isEnabled(feature)) {
      return true;
    } 

    console.warn(`Access denied. Feature "${feature}" is not enabled.`);
    return router.createUrlTree(['/']);
  }
};
