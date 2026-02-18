import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import {
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from './card.component';

describe('Card Components', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardDescriptionComponent,
        CardContentComponent,
      ],
    }).compileComponents();
  });

  it('should create CardComponent', () => {
    const fixture = TestBed.createComponent(CardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should create CardHeaderComponent', () => {
    const fixture = TestBed.createComponent(CardHeaderComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should create CardTitleComponent', () => {
    const fixture = TestBed.createComponent(CardTitleComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should create CardDescriptionComponent', () => {
    const fixture = TestBed.createComponent(CardDescriptionComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should create CardContentComponent', () => {
    const fixture = TestBed.createComponent(CardContentComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
