import { render, screen } from '@testing-library/angular';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  it('should render the login page', async () => {
    await render(LoginPageComponent);
    expect(screen.getByText('Login')).toBeTruthy();
  });
});
