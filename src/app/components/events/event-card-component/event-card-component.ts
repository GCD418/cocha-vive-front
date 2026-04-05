import { CommonModule } from '@angular/common';
import { Component, Input, input } from '@angular/core';
import { EventModel } from '../../../models/event-model';
import { PricePipe } from '../../../shared/pipes/price.pipe';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-event-card-component',
  imports: [CommonModule, PricePipe, RouterLink, TranslateModule],
  templateUrl: './event-card-component.html',
  styleUrl: './event-card-component.scss',
})
export class EventCardComponent {
  @Input({required: true}) event!: EventModel;

}
