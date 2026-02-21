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

@Component({
  selector: 'ui-button',
  standalone: false,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() variant = 'btn-primary';
  @Input() className = '';
}


