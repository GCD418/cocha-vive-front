import { Router } from '@angular/router';
import { Component} from '@angular/core';
import { EventFormResult, EventFormComponent } from '../../components/events/event-form-component/event-form-component';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [EventFormComponent],
  templateUrl: './event-create.html',
  styleUrl: './event-create.css',
})
export class EventCreate{

  constructor(private router: Router) {}

  onFormResult(result: EventFormResult): void {
    if (result.success) {
      setTimeout(() => this.router.navigate(['/events']), 2000);
    } else {
      this.router.navigate(['/events']);
    }
  }
}
