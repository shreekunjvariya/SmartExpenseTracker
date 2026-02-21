import { Component } from '@angular/core';

interface LandingFeature {
  title: string;
  description: string;
  icon: string;
}

interface ProfileTypeCard {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'landing-page',
  standalone: false,
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  readonly features: LandingFeature[] = [
    {
      icon: 'PIE',
      title: 'Smart Categories',
      description:
        'Multi-level categories tailored to your profile: salaried, self-employed, or business owner.',
    },
    {
      icon: 'FX',
      title: '40+ Currencies',
      description:
        'Track expenses in multiple currencies with built-in conversion support.',
    },
    {
      icon: 'CHART',
      title: 'Visual Reports',
      description:
        'Understand spending patterns with category and trend breakdowns.',
    },
    {
      icon: 'CSV',
      title: 'CSV Import/Export',
      description:
        'Import historical data and export reports quickly for accounting.',
    },
  ];

  readonly profileTypes: ProfileTypeCard[] = [
    {
      title: 'Salaried',
      description: 'Track personal expenses, utilities, groceries, and entertainment.',
      icon: 'SAL',
    },
    {
      title: 'Self-Employed',
      description: 'Manage business operations, client meetings, and deductible expenses.',
      icon: 'SELF',
    },
    {
      title: 'Business Owner',
      description: 'Monitor payroll, operations, inventory, and department spending.',
      icon: 'BIZ',
    },
  ];
}



