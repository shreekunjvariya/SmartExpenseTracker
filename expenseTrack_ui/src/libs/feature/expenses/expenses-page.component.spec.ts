import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { AuthService } from '../../data-access/auth/auth.service';
import { CategoriesService } from '../../data-access/categories/categories.service';
import { ExpensesService } from '../../data-access/expenses/expenses.service';
import { ExpensesPageComponent } from './expenses-page.component';

describe('ExpensesPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ExpensesPageComponent],
      providers: [
        {
          provide: ExpensesService,
          useValue: {
            list: jest.fn(() => of([])),
            create: jest.fn(() => of({})),
            update: jest.fn(() => of({})),
            delete: jest.fn(() => of(void 0)),
          },
        },
        {
          provide: CategoriesService,
          useValue: {
            list: jest.fn(() => of([])),
          },
        },
        {
          provide: AuthService,
          useValue: {
            user: {
              user_id: 'u1',
              email: 'user@example.com',
              name: 'User Test',
              profile_type: 'salaried',
              preferred_currency: 'USD',
            },
            token: 'token',
            me: jest.fn(() => of(null)),
          },
        },
      ],
    }).compileComponents();
  });

  it('should render the expenses page', () => {
    const fixture = TestBed.createComponent(ExpensesPageComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Expenses');
  });
});
