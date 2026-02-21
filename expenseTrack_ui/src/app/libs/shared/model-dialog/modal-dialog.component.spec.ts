import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent, ModalComponent } from './modal-dialog.component';

describe('Modal/Dialog Components', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [ModalComponent, ConfirmDialogComponent],
    }).compileComponents();
  });

  it('should create ModalComponent', () => {
    const fixture = TestBed.createComponent(ModalComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should create ConfirmDialogComponent', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
