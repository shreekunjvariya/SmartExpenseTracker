import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-alert',
  standalone: false,
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
})
export class AlertComponent {
  @Input() message = '';
  @Input() type: 'success' | 'error' = 'success';
}
