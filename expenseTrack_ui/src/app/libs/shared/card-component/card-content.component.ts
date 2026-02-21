import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-card-content',
  standalone: false,
  templateUrl: './card-content.component.html',
  styleUrl: './card-content.component.scss',
})
export class CardContentComponent {
  @Input() className = '';
}
