import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-card',
  standalone: false,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input() className = '';
}


