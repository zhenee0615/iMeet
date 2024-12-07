import { Component, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-statistic',
  standalone: false,
  
  templateUrl: './statistic.component.html',
  styleUrl: './statistic.component.scss'
})
export class StatisticComponent {
  virtualEvents: number = 0;
  happyUsers: number = 0;
  customerSatisfaction: number = 0;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    const counters = this.el.nativeElement.querySelectorAll('.count');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.startCounting(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      });
    });

    counters.forEach((counter: HTMLElement) => {
      observer.observe(counter);
    });
  }

  startCounting(element: HTMLElement): void {
    const target = +element.getAttribute('data-target')!;
    const duration = 2000;
    const increment = target / (duration / 10);
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target.toLocaleString();
        clearInterval(interval);
      } else {
        element.textContent = Math.ceil(current).toLocaleString();
      }
    }, 10);
  }
}
