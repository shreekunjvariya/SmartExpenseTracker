import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent, InputComponent } from './input-button.component';

describe('Input/Button Components', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule],
      declarations: [InputComponent, ButtonComponent],
    }).compileComponents();
  });

  it('should create InputComponent', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.componentInstance.formControl = new FormControl('');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should create ButtonComponent', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
