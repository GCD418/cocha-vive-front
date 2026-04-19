import { Router } from '@angular/router';
import { Component} from '@angular/core';
import { EventFormResult, EventFormComponent } from '../../components/events/event-form-component/event-form-component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [EventFormComponent, TranslateModule],
  templateUrl: './event-create.html',
  styleUrl: './event-create.css',
})
export class EventCreate{

  constructor(private router: Router) {}

  onFormResult(result: EventFormResult): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (result.success) {
      setTimeout(() => this.router.navigate(['/publisher/my-events']), 2000);
    } else {
      this.router.navigate(['/publisher/my-events']);
    }
  }
}
