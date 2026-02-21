import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { CardDescriptionComponent } from './card-description.component';

describe('CardDescriptionComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [CardDescriptionComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CardDescriptionComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
