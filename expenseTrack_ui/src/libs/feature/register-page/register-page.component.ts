import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../data-access/auth/auth.service';
import { Router } from '@angular/router';
import { User } from '../../../models';

@Component({
  selector: 'register-page',
  standalone: false,
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
})
export class RegisterPageComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  form = inject(FormBuilder).group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    profile_type: ['salaried', Validators.required],
    preferred_currency: ['USD', Validators.required],
  });
  loading = false;
  error = '';

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const raw = this.form.getRawValue();
    const payload: Partial<User> & { password: string } = {
      name: raw.name ?? '',
      email: raw.email ?? '',
      password: raw.password ?? '',
      profile_type: raw.profile_type as User['profile_type'],
      preferred_currency: raw.preferred_currency ?? 'USD',
    };
    this.auth.register(payload).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.error = err?.error?.message || 'Registration failed';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}



