import {
  NgModule,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { App } from './app';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { LandingPageComponent } from '../libs/feature/landing-page/landing-page.component';
import { LoginPageComponent } from '../libs/feature/login-page/login-page.component';
import { RegisterPageComponent } from '../libs/feature/register-page/register-page.component';
import { DashboardPageComponent } from '../libs/feature/dashboard/dashboard-page.component';
import { ExpensesPageComponent } from '../libs/feature/expenses/expenses-page.component';
import { CategoriesPageComponent } from '../libs/feature/categories-page/categories-page.component';
import { SettingsPageComponent } from '../libs/feature/settings/settings-page.component';
import { ReportsPageComponent } from '../libs/feature/reports/reports-page.component';
import { CardComponent, CardContentComponent, CardDescriptionComponent, CardHeaderComponent, CardTitleComponent } from '../libs/ui/shared/card.component';
import { InputComponent, ButtonComponent } from '../libs/ui/shared/input-button.component';
import { ModalComponent, ConfirmDialogComponent } from '../libs/ui/shared/modal-dialog.component';
import { AlertComponent, SpinnerComponent } from '../libs/ui/shared/alert-spinner.component';
import { SidebarComponent } from '../libs/ui/layout/sidebar.component';
import { ProtectedLayoutComponent } from '../libs/ui/layout/protected-layout.component';

@NgModule({
  declarations: [
    App,
    LandingPageComponent,
    LoginPageComponent,
    RegisterPageComponent,
    DashboardPageComponent,
    ExpensesPageComponent,
    CategoriesPageComponent,
    ReportsPageComponent,
    SettingsPageComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    InputComponent,
    ButtonComponent,
    ModalComponent,
    ConfirmDialogComponent,
    AlertComponent,
    SpinnerComponent,
    SidebarComponent,
    ProtectedLayoutComponent,
  ],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule, AppRoutingModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
  bootstrap: [App],
})
export class AppModule {}
