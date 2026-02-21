import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-card-description',
  standalone: false,
  templateUrl: './card-description.component.html',
  styleUrl: './card-description.component.scss',
})
export class CardDescriptionComponent {
  @Input() className = '';
}
