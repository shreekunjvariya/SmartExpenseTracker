import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ui-modal',
  standalone: false,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
}

@Component({
  selector: 'ui-confirm-dialog',
  standalone: false,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Confirm';
  @Input() message = '';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}


