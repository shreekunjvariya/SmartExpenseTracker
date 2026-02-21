import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { of } from 'rxjs';
import { AuthService } from '../../data-access/auth/auth.service';
import { CategoriesService } from '../../data-access/categories/categories.service';
import { DashboardService } from '../../data-access/dashboard/dashboard.service';
import { ExpensesService } from '../../data-access/expenses/expenses.service';
import { ReportsService } from '../../data-access/reports/reports.service';
import { ExpensesPageComponent } from './expenses-page.component';

describe('ExpensesPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatSelectModule,
      ],
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
          provide: DashboardService,
          useValue: {
            invalidateCache: jest.fn(),
          },
        },
        {
          provide: ReportsService,
          useValue: {
            invalidateSummaryCache: jest.fn(),
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
    expect(compiled.textContent).toContain('Transactions');
  });
});
