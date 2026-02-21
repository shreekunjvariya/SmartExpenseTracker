import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { AlertComponent, SpinnerComponent } from './alert-spinner.component';

describe('Alert/Spinner Components', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [AlertComponent, SpinnerComponent],
    }).compileComponents();
  });

  it('should create AlertComponent', () => {
    const fixture = TestBed.createComponent(AlertComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should create SpinnerComponent', () => {
    const fixture = TestBed.createComponent(SpinnerComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
