import { Component, Input, NgZone  } from '@angular/core';
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
  @Input() latitude: number = 0;
  @Input() longitude: number = 0;
  @Input() locationName: string = '';

  apiLoaded = false;

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.loadGoogleMaps();
  }

  private loadGoogleMaps() {
    if (typeof (window as any).google !== 'undefined' && (window as any).google.maps?.importLibrary) {
      this.ngZone.run(() => { this.apiLoaded = true; });
      return;
    }

    (window as any).googleMapsCallback = () => {
      this.ngZone.run(() => { this.apiLoaded = true; });
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

  get center(): google.maps.LatLngLiteral {
    return { lat: this.latitude, lng: this.longitude };
  }

  get markerPosition(): google.maps.LatLngLiteral {
    return { lat: this.latitude, lng: this.longitude };
  }

  mapOptions: google.maps.MapOptions = {
    zoom: 15,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    mapId: 'DEMO_MAP_ID'
  };
}
