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
import { AlertComponent } from './libs/shared/alert-spinner/alert.component';
import { SpinnerComponent } from './libs/shared/alert-spinner/spinner.component';
import { CardComponent } from './libs/shared/card-component/card.component';
import { CardContentComponent } from './libs/shared/card-component/card-content.component';
import { CardDescriptionComponent } from './libs/shared/card-component/card-description.component';
import { CardHeaderComponent } from './libs/shared/card-component/card-header.component';
import { CardTitleComponent } from './libs/shared/card-component/card-title.component';
import { ButtonComponent } from './libs/shared/input-button/button.component';
import { InputComponent } from './libs/shared/input-button/input.component';
import { ConfirmDialogComponent } from './libs/shared/model-dialog/confirm-dialog.component';
import { ModalComponent } from './libs/shared/model-dialog/modal.component';


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
