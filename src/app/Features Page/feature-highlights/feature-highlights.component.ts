import { Component } from '@angular/core';

@Component({
  selector: 'app-feature-highlights',
  standalone: false,
  
  templateUrl: './feature-highlights.component.html',
  styleUrl: './feature-highlights.component.scss'
})
export class FeatureHighlightsComponent {
  features = [
    {
      image: 'facial_recognition.jpg',
      title: 'Authorized Access',
      description: 'Our platform leverages advanced facial recognition technology to ensure that only authorized participants can join virtual events. This eliminates the risk of unauthorized access, ensuring that your meetings and events remain secure and private. Facial recognition serves as an additional layer of authentication, enhancing trust and reliability in every interaction.'
    },
    {
      image: 'enhance_security.jpg',
      title: 'Enhanced Security',
      description: 'Security is at the core of our platform. With end-to-end encryption and facial recognition-based authentication, your virtual events are protected against unauthorized access and data breaches. This feature ensures that sensitive discussions and information shared during events remain confidential, giving you peace of mind.'
    },
    {
      image: 'virtual_meeting.jpg',
      title: 'Virtual Event Hosting',
      description: 'Create, host, and manage virtual events with ease. Our platform offers a seamless and user-friendly interface for setting up engaging online events. From small team meetings to large-scale webinars, the iMeet platform supports high-quality audio, video, and interactive tools, ensuring an immersive experience for all participants.'
    }
  ];
}
