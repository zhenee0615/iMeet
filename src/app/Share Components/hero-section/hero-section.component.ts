import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  standalone: false,
  
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss'
})
export class HeroSectionComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() backgroundGradient: string = 'linear-gradient(to right, #959595, black)';
}
