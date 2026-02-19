import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { CategoriesService } from '../../data-access/categories/categories.service';
import { CategoriesPageComponent } from './categories-page.component';

describe('CategoriesPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CategoriesPageComponent],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            list: jest.fn(() => of([])),
            create: jest.fn(() => of({})),
            update: jest.fn(() => of({})),
            delete: jest.fn(() => of(void 0)),
            addSubcategory: jest.fn(() => of({})),
            deleteSubcategory: jest.fn(() => of(void 0)),
          },
        },
      ],
    }).compileComponents();
  });

  it('should render the categories page', () => {
    const fixture = TestBed.createComponent(CategoriesPageComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Categories');
  });
});
