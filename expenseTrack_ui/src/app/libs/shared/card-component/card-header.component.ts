import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-card-header',
  standalone: false,
  templateUrl: './card-header.component.html',
  styleUrl: './card-header.component.scss',
})
export class CardHeaderComponent {
  @Input() className = '';
}
