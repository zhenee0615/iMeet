import { Component } from '@angular/core';

@Component({
  selector: 'app-team',
  standalone: false,
  
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent {
  teamMembers = [
    {
      name: 'Toh Zhen Ee',
      role: 'Founder & CEO',
      image: 'Team_member_1.png'
    },
    {
      name: 'Sam Wilson',
      role: 'Chief Technology Officer',
      image: 'Team_member_2.png'
    },
    {
      name: 'Jane Smith',
      role: 'Marketing Lead',
      image: 'Team_member_3.png'
    }
  ];
}
