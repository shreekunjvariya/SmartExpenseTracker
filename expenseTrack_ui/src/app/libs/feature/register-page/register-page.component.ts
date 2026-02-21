import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../data-access/auth/auth.service';
import { Router } from '@angular/router';
import { User } from '../../../../models';
import { PROFILE_OPTIONS, REGISTRATION_CURRENCY_OPTIONS } from '../../shared/constants/options.constants';

@Component({
  selector: 'register-page',
  standalone: false,
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
})
export class RegisterPageComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  form = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    profile_type: ['salaried', Validators.required],
    preferred_currency: ['INR', Validators.required],
  });
  loading = false;
  error = '';

  readonly profileOptions = PROFILE_OPTIONS;
  readonly currencyOptions = REGISTRATION_CURRENCY_OPTIONS;

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const raw = this.form.getRawValue();
    const payload: Partial<User> & { password: string } = {
      name: raw.name ?? '',
      email: raw.email ?? '',
      password: raw.password ?? '',
      profile_type: raw.profile_type as User['profile_type'],
      preferred_currency: raw.preferred_currency ?? 'INR',
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err?.error?.detail || err?.error?.message || 'Registration failed';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}



