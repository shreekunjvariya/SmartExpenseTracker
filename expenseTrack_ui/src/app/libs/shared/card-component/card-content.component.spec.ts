import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { CardContentComponent } from './card-content.component';

describe('CardContentComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [CardContentComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CardContentComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
