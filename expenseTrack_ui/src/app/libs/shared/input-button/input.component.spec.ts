import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule],
      declarations: [InputComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.componentInstance.formControl = new FormControl('');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
