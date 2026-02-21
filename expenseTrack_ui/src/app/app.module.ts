import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  NgModule,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { App } from './app';
import { AppRoutingModule } from './app-routing.module';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { CategoriesPageComponent } from './libs/feature/categories-page/categories-page.component';
import { DashboardPageComponent } from './libs/feature/dashboard/dashboard-page.component';
import { ExpensesPageComponent } from './libs/feature/expenses/expenses-page.component';
import { LandingPageComponent } from './libs/feature/landing-page/landing-page.component';
import { LoginPageComponent } from './libs/feature/login-page/login-page.component';
import { RegisterPageComponent } from './libs/feature/register-page/register-page.component';
import { ReportsPageComponent } from './libs/feature/reports/reports-page.component';
import { SettingsPageComponent } from './libs/feature/settings/settings-page.component';
import { ProtectedLayoutComponent } from './libs/layout/protected-layout/protected-layout.component';
import { SidebarComponent } from './libs/layout/sidebar/sidebar.component';
import { AlertComponent, SpinnerComponent } from './libs/shared/alert-spinner/alert-spinner.component';
import { CardComponent, CardContentComponent, CardDescriptionComponent, CardHeaderComponent, CardTitleComponent } from './libs/shared/card-component/card.component';
import { ButtonComponent, InputComponent } from './libs/shared/input-button/input-button.component';
import { ConfirmDialogComponent, ModalComponent } from './libs/shared/model-dialog/modal-dialog.component';


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
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    AppRoutingModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
  bootstrap: [App],
})
export class AppModule {}
