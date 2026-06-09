import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error-banner.html',
  styleUrl: './error-banner.css',
})
export class ErrorBannerComponent {
  @Input() message = '';
  @Input() showRetry = false;
  @Input() dismissible = true;
  @Output() retry = new EventEmitter<void>();
  @Output() dismissed = new EventEmitter<void>();
}
