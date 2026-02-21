import { Route } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginPageComponent } from './libs/feature/login-page/login-page.component';
import { RegisterPageComponent } from './libs/feature/register-page/register-page.component';
import { DashboardPageComponent } from './libs/feature/dashboard/dashboard-page.component';
import { ExpensesPageComponent } from './libs/feature/expenses/expenses-page.component';
import { CategoriesPageComponent } from './libs/feature/categories-page/categories-page.component';
import { ReportsPageComponent } from './libs/feature/reports/reports-page.component';
import { SettingsPageComponent } from './libs/feature/settings/settings-page.component';
import { LandingPageComponent } from './libs/feature/landing-page/landing-page.component';
import { ProtectedLayoutComponent } from './libs/layout/protected-layout/protected-layout.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: LandingPageComponent,
	},
	{
		path: 'login',
		component: LoginPageComponent,
	},
	{
		path: 'register',
		component: RegisterPageComponent,
	},
  {
    path: '',
    component: ProtectedLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardPageComponent,
      },
      {
        path: 'expenses',
        component: ExpensesPageComponent,
      },
      {
        path: 'categories',
        component: CategoriesPageComponent,
      },
      {
        path: 'reports',
        component: ReportsPageComponent,
      },
      {
        path: 'settings',
        component: SettingsPageComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
