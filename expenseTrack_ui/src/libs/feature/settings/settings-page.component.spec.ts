import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { AuthService } from '../../data-access/auth/auth.service';
import { CurrencyService } from '../../data-access/currency/currency.service';
import { SettingsPageComponent } from './settings-page.component';

describe('SettingsPageComponent', () => {
  beforeEach(async () => {
    const user = {
      user_id: 'u1',
      email: 'user@example.com',
      name: 'User Test',
      profile_type: 'salaried',
      preferred_currency: 'USD',
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [SettingsPageComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            user,
            token: 'token',
            me: jest.fn(() => of(user)),
            updateProfile: jest.fn(() => of(user)),
          },
        },
        {
          provide: CurrencyService,
          useValue: {
            convert: jest.fn(() =>
              of({
                from: 'USD',
                to: 'EUR',
                original_amount: 1,
                converted_amount: 1,
                rate: 1,
              })
            ),
          },
        },
      ],
    }).compileComponents();
  });

  it('should render the settings page', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Profile Settings');
  });
});
