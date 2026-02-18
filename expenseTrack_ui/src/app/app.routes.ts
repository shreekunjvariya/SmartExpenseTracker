import { Route } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LandingPageComponent } from '../libs/feature/landing-page/landing-page.component';
import { LoginPageComponent } from '../libs/feature/login-page/login-page.component';
import { RegisterPageComponent } from '../libs/feature/register-page/register-page.component';
import { DashboardPageComponent } from '../libs/feature/dashboard/dashboard-page.component';
import { ExpensesPageComponent } from '../libs/feature/expenses/expenses-page.component';
import { CategoriesPageComponent } from '../libs/feature/categories-page/categories-page.component';
import { ReportsPageComponent } from '../libs/feature/reports/reports-page.component';
import { SettingsPageComponent } from '../libs/feature/settings/settings-page.component';

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
		path: 'dashboard',
		component: DashboardPageComponent,
		canActivate: [authGuard],
	},
	{
		path: 'expenses',
		component: ExpensesPageComponent,
		canActivate: [authGuard],
	},
	{
		path: 'categories',
		component: CategoriesPageComponent,
		canActivate: [authGuard],
	},
	{
		path: 'reports',
		component: ReportsPageComponent,
		canActivate: [authGuard],
	},
	{
		path: 'settings',
		component: SettingsPageComponent,
		canActivate: [authGuard],
	},
];
