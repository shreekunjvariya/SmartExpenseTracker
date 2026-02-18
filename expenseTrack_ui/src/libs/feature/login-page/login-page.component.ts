import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../data-access/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'login-page',
  standalone: false,
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  form = inject(FormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  loading = false;
  error = '';

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.error = err?.error?.message || 'Login failed';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}



