import { Component, Input, NgZone, computed, signal  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { environment } from '../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-event-map-modal',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, TranslateModule],
  templateUrl: './event-map-modal.html',
  styleUrl: './event-map-modal.css',
})
export class EventMapModalComponent {
  @Input() set latitude(value: number) {
    this.latitudeSignal.set(value);
  }

  @Input() set longitude(value: number) {
    this.longitudeSignal.set(value);
  }

  @Input() locationName: string = '';

  apiLoaded = signal(false);
  private latitudeSignal = signal(0);
  private longitudeSignal = signal(0);

  readonly center = computed<google.maps.LatLngLiteral>(() => ({
    lat: this.latitudeSignal(),
    lng: this.longitudeSignal(),
  }));

  readonly markerPosition = computed<google.maps.LatLngLiteral>(() => ({
    lat: this.latitudeSignal(),
    lng: this.longitudeSignal(),
  }));

  readonly hasCoordinates = computed(() => this.latitudeSignal() !== 0 && this.longitudeSignal() !== 0);

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.loadGoogleMaps();
  }

  private loadGoogleMaps() {
    if (typeof (window as any).google !== 'undefined' && (window as any).google.maps?.importLibrary) {
      this.ngZone.run(() => { this.apiLoaded.set(true); });
      return;
    }

    (window as any).googleMapsCallback = () => {
      this.ngZone.run(() => { this.apiLoaded.set(true); });
    };

    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&loading=async&callback=googleMapsCallback`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  mapOptions: google.maps.MapOptions = {
    zoom: 15,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    mapId: 'DEMO_MAP_ID'
  };
}
