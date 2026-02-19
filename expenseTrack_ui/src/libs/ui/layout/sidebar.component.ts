import { Component, DestroyRef, Input, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../data-access/auth/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { User } from '../../../models';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  testId: string;
}

@Component({
  selector: 'sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() user: User | null = null;

  private auth = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  mobileOpen = false;
  loggingOut = false;

  readonly menuItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'D', testId: 'nav-dashboard' },
    { label: 'Expenses', path: '/expenses', icon: 'E', testId: 'nav-expenses' },
    { label: 'Categories', path: '/categories', icon: 'C', testId: 'nav-categories' },
    { label: 'Reports', path: '/reports', icon: 'R', testId: 'nav-reports' },
    { label: 'Settings', path: '/settings', icon: 'S', testId: 'nav-settings' },
  ];

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.mobileOpen = false;
      });
  }

  get userInitial(): string {
    return this.user?.name?.charAt(0).toUpperCase() || 'U';
  }

  toggleMobile(): void {
    this.mobileOpen = !this.mobileOpen;
  }

  closeMobile(): void {
    this.mobileOpen = false;
  }

  logout(): void {
    if (this.loggingOut) {
      return;
    }

    this.loggingOut = true;
    this.auth.logout().subscribe({
      next: () => {
        this.loggingOut = false;
        this.router.navigate(['/']);
      },
      error: () => {
        this.loggingOut = false;
        this.auth.resetSession();
        this.router.navigate(['/']);
      },
    });
  }
}



