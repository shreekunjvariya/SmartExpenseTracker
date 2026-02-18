import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../data-access/auth/auth.service';

@Component({
  selector: 'sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}



