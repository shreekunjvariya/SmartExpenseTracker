import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { AuthService } from '../../data-access/auth/auth.service';
import { ReportsService } from '../../data-access/reports/reports.service';
import { ReportsPageComponent } from './reports-page.component';

describe('ReportsPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ReportsPageComponent],
      providers: [
        {
          provide: ReportsService,
          useValue: {
            getSummary: jest.fn(() =>
              of({
                total: 0,
                count: 0,
                by_category: [],
                daily_trend: [],
                period: 'month',
                currency: 'USD',
              })
            ),
            exportCsv: jest.fn(() => of(new Blob())),
            importCsv: jest.fn(() => of({ imported: 0, errors: [] })),
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

  it('should render the reports page', () => {
    const fixture = TestBed.createComponent(ReportsPageComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Reports');
  });
});
