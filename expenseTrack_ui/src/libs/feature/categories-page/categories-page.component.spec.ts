import { render, screen } from '@testing-library/angular';
import { CategoriesPageComponent } from './categories-page.component';

describe('CategoriesPageComponent', () => {
  it('should render the categories page', async () => {
    await render(CategoriesPageComponent, { componentProperties: { categories: [] } });
    expect(screen.getByText('Categories')).toBeTruthy();
  });
});
