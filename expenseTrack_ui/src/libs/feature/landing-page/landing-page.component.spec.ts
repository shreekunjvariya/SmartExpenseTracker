import { render, screen } from '@testing-library/angular';
import { LandingPageComponent } from './landing-page.component';

describe('LandingPageComponent', () => {
  it('should render the landing page', async () => {
    await render(LandingPageComponent);
    expect(screen.getByText('ExpenseTrack')).toBeTruthy();
  });
});
