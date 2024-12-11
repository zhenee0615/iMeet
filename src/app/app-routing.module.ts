import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainpageComponent } from './Landing Page/mainpage/mainpage.component';
import { AboutUsComponent } from './About Us Page/about-us/about-us.component';
import { FeaturesPageComponent } from './Features Page/features-page/features-page.component';
import { ContactUsComponent } from './Contact Us Page/contact-us/contact-us.component';
import { LoginComponent } from './Login & Sign Up/login/login.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'features', component: FeaturesPageComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: '', component: MainpageComponent },
  { path: '', redirectTo: '/mainpage', pathMatch: 'full' },
  { path: '**', redirectTo: '/mainpage' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
