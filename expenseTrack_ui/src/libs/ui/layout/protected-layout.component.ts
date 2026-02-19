import { Component, inject } from '@angular/core';
import { AuthService } from '../../data-access/auth/auth.service';

@Component({
  selector: 'protected-layout',
  standalone: false,
  templateUrl: './protected-layout.component.html',
  styleUrl: './protected-layout.component.scss',
})
export class ProtectedLayoutComponent {
  private auth = inject(AuthService);
  user$ = this.auth.user$;

  constructor() {
    if (this.auth.token && !this.auth.user) {
      this.auth.me().subscribe({
        error: () => this.auth.resetSession(),
      });
    }
  }
}



