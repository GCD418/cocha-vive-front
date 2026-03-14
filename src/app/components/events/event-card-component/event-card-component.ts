import { CommonModule } from '@angular/common';
import { Component, Input, input } from '@angular/core';
import { EventModel } from '../../../event-model';

@Component({
  selector: 'app-event-card-component',
  imports: [CommonModule],
  templateUrl: './event-card-component.html',
  styleUrl: './event-card-component.scss',
})
export class EventCardComponent {
  @Input({required: true}) event!: EventModel;

  get formattedPrice(): number {
    return this.event.cost === 0 ? 0 : this.event.cost / 100;
  }
}
