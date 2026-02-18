import { render, screen } from '@testing-library/angular';
import { RegisterPageComponent } from './register-page.component';

describe('RegisterPageComponent', () => {
  it('should render the register page', async () => {
    await render(RegisterPageComponent);
    expect(screen.getByText('Register')).toBeTruthy();
  });
});
