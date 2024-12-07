import { Component } from '@angular/core';

@Component({
  selector: 'app-benefits',
  standalone: false,
  
  templateUrl: './benefits.component.html',
  styleUrl: './benefits.component.scss'
})
export class BenefitsComponent {
  benefits = [
    {
      icon: 'bi bi-bar-chart',
      title: 'Accurate Reports',
      description: 'Access detailed attendance reports and analytics to evaluate participant engagement and event success. Real-time tracking and post-event summaries offer actionable insights for future improvements.'
    },
    {
      icon: 'bi bi-clock-history',
      title: 'Time Efficiency',
      description: 'Streamline tasks like attendance tracking and reporting, saving time and reducing administrative effort. Focus on delivering engaging content while the platform handles the logistics.'
    },
    {
      icon: 'bi bi-people',
      title: 'Seamless User Experience',
      description: 'Provide a user-friendly interface that ensures a smooth journey for all participants. From secure logins to interactive tools, the platform delivers accessibility and satisfaction.'
    },
    {
      icon: 'bi bi-gear-wide-connected',
      title: 'Customizable Events',
      description: 'Adjust layouts, features, and branding to meet your unique event requirements. From small meetings to large conferences, the platform supports diverse needs with ease.'
    }
  ];
}
