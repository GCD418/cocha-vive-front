import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { AppFeatures } from '../../models/app-features';
import { environment } from '../../../environments/environment';
import { lastValueFrom, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FeatureToggleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/config/features`;

  private featuresSignal = signal<Partial<AppFeatures>>({});

  public features = this.featuresSignal.asReadonly();

  loadFeatures(): Promise<void> {
    const request$ = this.http.get<AppFeatures>(this.apiUrl)
    .pipe(
      tap(flags => this.featuresSignal.set(flags))
    );

    return lastValueFrom(request$).then(() => {}).catch(err => {
      console.error('Critial error loading feature flags:', err);
    });
  }

  isEnabled(feature: keyof AppFeatures): boolean {
    return !!this.featuresSignal()[feature];
  }
}
