import { Component } from '@angular/core';

@Component({
  selector: 'app-description',
  standalone: false,
  
  templateUrl: './description.component.html',
  styleUrl: './description.component.scss'
})
export class DescriptionComponent {
  platformDescriptions = [
    {
      icon: 'bi bi-shield-check',
      title: 'Secure and Reliable',
      description:
        'With advanced facial recognition and end-to-end encryption, iMeet ensures the safety and security of your virtual events, giving you peace of mind.'
    },
    {
      icon: 'bi bi-people',
      title: 'Seamless Connectivity',
      description:
        'iMeet provides a user-friendly platform that makes joining, hosting, and managing events effortless for everyone involved.'
    },
    {
      icon: 'bi bi-bar-chart-line',
      title: 'Actionable Insights',
      description:
        'Gain access to detailed analytics and insights from your events to improve engagement and optimize future planning.'
    }
  ];
}
