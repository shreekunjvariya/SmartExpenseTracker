import { render, screen } from '@testing-library/angular';
import { ReportsPageComponent } from './reports-page.component';

describe('ReportsPageComponent', () => {
  it('should render the reports page', async () => {
    await render(ReportsPageComponent, { componentProperties: { summary: {}, period: 'week' } });
    expect(screen.getByText('Reports')).toBeTruthy();
  });
});
