import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../data-access/auth/auth.service';
import { CurrencyService } from '../../data-access/currency/currency.service';
import { CurrencyConvertResponse, ProfileType, User } from '../../../../models';
import { PROFILE_OPTIONS, SETTINGS_CURRENCY_OPTIONS } from '../../shared/constants/options.constants';

@Component({
  selector: 'settings-page',
  standalone: false,
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
})
export class SettingsPageComponent implements OnInit {
  private auth = inject(AuthService);
  private currencyService = inject(CurrencyService);
  private fb = inject(FormBuilder);

  user: User | null = null;
  loading = false;
  error = '';
  success = '';

  converterAmount = '';
  fromCurrency = 'USD';
  toCurrency = 'EUR';
  converting = false;
  convertError = '';
  convertResult: CurrencyConvertResponse | null = null;

  readonly profileTypes = PROFILE_OPTIONS;
  readonly currencies = SETTINGS_CURRENCY_OPTIONS;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    profile_type: ['salaried' as ProfileType, Validators.required],
    preferred_currency: ['USD', Validators.required],
  });

  ngOnInit(): void {
    this.user = this.auth.user;
    if (this.user) {
      this.patchForm(this.user);
      return;
    }

    this.auth.me().subscribe({
      next: (user) => {
        this.user = user;
        this.patchForm(user);
      },
      error: () => {
        this.error = 'Failed to load profile.';
      },
    });
  }

  saveSettings(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const raw = this.form.getRawValue();
    this.auth
      .updateProfile({
        name: raw.name,
        profile_type: raw.profile_type,
        preferred_currency: raw.preferred_currency,
      })
      .subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.patchForm(updatedUser);
          this.loading = false;
          this.success = 'Profile updated successfully.';
        },
        error: () => {
          this.loading = false;
          this.error = 'Failed to update profile.';
        },
      });
  }

  convertCurrency(): void {
    if (!this.converterAmount || this.converting) {
      return;
    }

    this.convertError = '';
    this.convertResult = null;
    this.converting = true;

    const amount = Number(this.converterAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      this.convertError = 'Enter a valid amount.';
      this.converting = false;
      return;
    }

    this.currencyService.convert(amount, this.fromCurrency, this.toCurrency).subscribe({
      next: (result) => {
        this.convertResult = result;
        this.converting = false;
      },
      error: () => {
        this.convertError = 'Conversion failed.';
        this.converting = false;
      },
    });
  }

  private patchForm(user: User): void {
    this.form.reset({
      name: user.name || '',
      profile_type: user.profile_type || 'salaried',
      preferred_currency: user.preferred_currency || 'USD',
    });
  }
}
