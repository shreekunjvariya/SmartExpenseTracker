import { Component, OnInit, inject } from '@angular/core';
import { ReportsService } from '../../data-access/reports/reports.service';

@Component({
  selector: 'reports-page',
  standalone: false,
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss',
})
export class ReportsPageComponent implements OnInit {
  private reports = inject(ReportsService);
  summary: any = {};
  period = 'week';

  ngOnInit() {
    this.loadSummary();
  }

  selectPeriod(period: string) {
    this.period = period;
    this.loadSummary();
  }

  loadSummary() {
    this.reports.getSummary(this.period).subscribe(data => this.summary = data);
  }
}



