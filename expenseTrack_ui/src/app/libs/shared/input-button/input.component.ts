import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-input',
  standalone: false,
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent {
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() className = '';
  @Input() formControl: any;
}
