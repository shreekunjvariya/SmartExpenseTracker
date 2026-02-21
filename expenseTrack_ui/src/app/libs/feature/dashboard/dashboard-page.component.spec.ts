import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthService } from '../../data-access/auth/auth.service';
import { DashboardService } from '../../data-access/dashboard/dashboard.service';
import { DashboardPageComponent } from './dashboard-page.component';

describe('DashboardPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [DashboardPageComponent],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getStats: jest.fn(() =>
              of({
                this_month: { total: 100, count: 1 },
                last_month: { total: 50, count: 1 },
                all_time: { total: 150, count: 2 },
                this_month_income: { total: 200, count: 1 },
                this_month_expense: { total: 100, count: 1 },
                this_month_net: 100,
                last_month_income: { total: 120, count: 1 },
                last_month_expense: { total: 50, count: 1 },
                last_month_net: 70,
                all_time_income: { total: 320, count: 2 },
                all_time_expense: { total: 150, count: 2 },
                all_time_net: 170,
                change_percentage: 100,
                net_change_percentage: 42.9,
                categories_count: 1,
                currency: 'USD',
              })
            ),
            getMonthlySummary: jest.fn(() =>
              of({
                total: 100,
                count: 1,
                income_total: 200,
                expense_total: 100,
                net_total: 100,
                income_count: 1,
                expense_count: 1,
                by_type: [],
                by_category: [],
                daily_trend: [],
                period: 'month',
                currency: 'USD',
              })
            ),
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

  it('should render the dashboard page', () => {
    const fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Dashboard');
  });
});
