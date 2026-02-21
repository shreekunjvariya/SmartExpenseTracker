import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { CardHeaderComponent } from './card-header.component';

describe('CardHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [CardHeaderComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CardHeaderComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
