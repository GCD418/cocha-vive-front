import { Component, EventEmitter, Input, OnInit, NgZone, Output, AfterViewInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { environment } from '../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';

declare const bootstrap: any;

@Component({
  selector: 'app-event-map-picker',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, TranslateModule],
  templateUrl: './event-map-picker.html',
  styleUrl: './event-map-picker.css',
})
export class EventMapPickerComponent implements OnInit {
  @Input() initialLatitude: number = -17.3895;
  @Input() initialLongitude: number = -66.1568;

  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();

  apiLoaded = false;
  markerPosition: google.maps.LatLngLiteral = { lat: -17.3895, lng: -66.1568 };

  private modalInstance: any;

  get center(): google.maps.LatLngLiteral {
    return this.markerPosition;
  }

  mapOptions: google.maps.MapOptions = {
    zoom: 15,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    mapId: 'DEMO_MAP_ID',
    draggableCursor: 'crosshair'
  };

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    if (this.initialLatitude !== 0 && this.initialLongitude !== 0) {
      this.markerPosition = {
        lat: this.initialLatitude,
        lng: this.initialLongitude
      };
    }
    this.loadGoogleMaps();
  }

  openModal() {
    if (this.initialLatitude !== 0 && this.initialLongitude !== 0) {
      this.markerPosition = {
        lat: this.initialLatitude,
        lng: this.initialLongitude
      };
    }

    const modalEl = document.getElementById('mapPickerModal');
    if (modalEl) {
      this.modalInstance = new bootstrap.Modal(modalEl, {
        backdrop: true,
        keyboard: true
      });
      this.modalInstance.show();
    }
  }

  private loadGoogleMaps() {
    if (typeof (window as any).google !== 'undefined' && (window as any).google.maps?.importLibrary) {
      this.ngZone.run(() => { this.apiLoaded = true; });
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        this.ngZone.run(() => { this.apiLoaded = true; });
      });
      return;
    }

    (window as any).googleMapsCallback = () => {
      this.ngZone.run(() => { this.apiLoaded = true; });
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&loading=async&callback=googleMapsCallback`;
    script.async = true;
    document.head.appendChild(script);
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.markerPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
    }
  }

  confirmLocation() {
    this.locationSelected.emit(this.markerPosition);
  }
}
