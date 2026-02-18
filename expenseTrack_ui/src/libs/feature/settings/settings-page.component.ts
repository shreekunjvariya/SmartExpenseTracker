import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../data-access/auth/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { User } from '../../../models';

@Component({
  selector: 'settings-page',
  standalone: false,
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
})
export class SettingsPageComponent implements OnInit {
  private auth = inject(AuthService);
  form = inject(FormBuilder).group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    profile_type: ['salaried', Validators.required],
    preferred_currency: ['USD', Validators.required],
  });
  loading = false;
  error = '';
  success = false;

  ngOnInit() {
    const user = this.auth.user;
    if (user) {
      this.form.patchValue(user);
    } else {
      this.auth.me().subscribe(u => this.form.patchValue(u));
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.success = false;
    const raw = this.form.getRawValue();
    const payload: Partial<User> & { password: string } = {
      name: raw.name ?? '',
      email: raw.email ?? '',
      password: '',
      profile_type: raw.profile_type as User['profile_type'],
      preferred_currency: raw.preferred_currency ?? 'USD',
    };
    this.auth.register(payload).subscribe({
      next: () => {
        this.success = true;
      },
      error: err => {
        this.error = err?.error?.message || 'Update failed';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}



