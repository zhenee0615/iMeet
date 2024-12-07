import { Component } from '@angular/core';
import emailjs, { type EmailJSResponseStatus } from '@emailjs/browser';

interface contactForm {
  name: string;
  email: string;
  message: string;
}

@Component({
  selector: 'app-contact-form',
  standalone: false,
  
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss'
})
export class ContactFormComponent {
  form:contactForm = {
    name: '',
    email: '',
    message: ''
  };

  Submit() {
    emailjs.send('service_8ost6he', 'template_m4h6xj4', {...this.form}, {
      publicKey: 'GkBgHVn_qm6w4aeXX'
    })
  }
}
