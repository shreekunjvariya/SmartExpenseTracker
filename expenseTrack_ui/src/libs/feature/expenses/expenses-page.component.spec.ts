import { render, screen } from '@testing-library/angular';
import { ExpensesPageComponent } from './expenses-page.component';

describe('ExpensesPageComponent', () => {
  it('should render the expenses page', async () => {
    await render(ExpensesPageComponent, { componentProperties: { expenses: [] } });
    expect(screen.getByText('Expenses')).toBeTruthy();
  });
});
