import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom, APP_INITIALIZER, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { SocialAuthServiceConfig, GoogleLoginProvider, SOCIAL_AUTH_CONFIG } from '@abacritt/angularx-social-login';
import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { environment } from '../environments/environment';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader, TRANSLATE_HTTP_LOADER_CONFIG } from '@ngx-translate/http-loader';
import { FeatureToggleService } from './services/feature-toggle/feature-toggle.service';
import { AuthService } from './services/auth/auth.service';
import { A11yModule } from '@angular/cdk/a11y';

export function HttpLoaderFactory() {
  return new TranslateHttpLoader();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: {
        prefix: './assets/i18n/',
        suffix: '.json'
      }
    },

    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
        },
        fallbackLang: 'es' 
      })
    ),

    // ✅ A11yModule va SOLO, fuera del TranslateModule
    importProvidersFrom(A11yModule),

    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.googleClientId)
          }
        ],
        onError: (err) => {
          console.error('Google Auth Init Error:', err);
        }
      } as SocialAuthServiceConfig,
    },

    provideAppInitializer(() => {
      const featureToggleService = inject(FeatureToggleService);
      return featureToggleService.loadFeatures();
    }),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      authService.initAuthFromStorage();
    })
  ]
};