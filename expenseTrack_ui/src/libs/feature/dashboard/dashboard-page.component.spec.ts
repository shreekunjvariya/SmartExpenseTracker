import { render, screen } from '@testing-library/angular';
import { DashboardPageComponent } from './dashboard-page.component';

describe('DashboardPageComponent', () => {
  it('should render the dashboard page', async () => {
    await render(DashboardPageComponent, { componentProperties: { stats: [], summary: {} } });
    expect(screen.getByText('Dashboard')).toBeTruthy();
  });
});
