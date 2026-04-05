import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-event-map-modal',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './event-map-modal.html',
  styleUrl: './event-map-modal.css',
})
export class EventMapModal {
  @Input() latitude: number = 0;
  @Input() longitude: number = 0;
  @Input() locationName: string = '';

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
  };
}
