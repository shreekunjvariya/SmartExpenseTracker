import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-card-title',
  standalone: false,
  templateUrl: './card-title.component.html',
  styleUrl: './card-title.component.scss',
})
export class CardTitleComponent {
  @Input() className = '';
}
