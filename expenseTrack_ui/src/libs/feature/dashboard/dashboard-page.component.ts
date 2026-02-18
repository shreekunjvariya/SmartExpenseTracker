import { Component, OnInit, inject } from '@angular/core';
import { DashboardService } from '../../data-access/dashboard/dashboard.service';

@Component({
  selector: 'dashboard-page',
  standalone: false,
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent implements OnInit {
  private dashboard = inject(DashboardService);
  stats: any[] = [];
  summary: any = {};

  ngOnInit() {
    this.dashboard.getStats().subscribe(data => this.stats = data.stats || []);
    this.dashboard.getMonthlySummary().subscribe(data => this.summary = data);
  }
}



