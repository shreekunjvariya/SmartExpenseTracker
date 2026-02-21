import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { CardTitleComponent } from './card-title.component';

describe('CardTitleComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [CardTitleComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CardTitleComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
