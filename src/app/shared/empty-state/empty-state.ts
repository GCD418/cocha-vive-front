import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyStateComponent {
  @Input() icon = 'bi-inbox';
  @Input() title = '';
  @Input() description = '';
  @Input() ctaLabel = '';
  @Output() ctaClick = new EventEmitter<void>();
}
