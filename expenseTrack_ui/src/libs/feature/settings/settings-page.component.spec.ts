import { render, screen } from '@testing-library/angular';
import { SettingsPageComponent } from './settings-page.component';

describe('SettingsPageComponent', () => {
  it('should render the settings page', async () => {
    await render(SettingsPageComponent);
    expect(screen.getByText('Profile Settings')).toBeTruthy();
  });
});
