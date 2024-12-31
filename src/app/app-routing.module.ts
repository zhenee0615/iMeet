import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainpageComponent } from './Landing Page/mainpage/mainpage.component';
import { AboutUsComponent } from './About Us Page/about-us/about-us.component';
import { FeaturesPageComponent } from './Features Page/features-page/features-page.component';
import { ContactUsComponent } from './Contact Us Page/contact-us/contact-us.component';
import { LoginComponent } from './Login & Sign Up/login/login.component';
import { UserPortalComponent } from './User Portal/user-portal/user-portal.component';
import { DashboardComponent } from './User Portal/Dashboard/dashboard/dashboard.component';
import { ProfileComponent } from './User Portal/Profile/profile/profile.component';
import { ScheduleComponent } from './User Portal/Schedule/schedule/schedule.component';
import { GroupComponent } from './User Portal/Dashboard/Group/group/group.component';
import { VideoCallComponent } from './Video Conference/video-call/video-call.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'features', component: FeaturesPageComponent },
  { path: 'contact-us', component: ContactUsComponent },
  {
    path: 'user/:uid',
    component: UserPortalComponent,
    children: [
      { path: '', redirectTo: 'group', pathMatch: 'full' },
      { path: 'group', component: DashboardComponent },
      { path: 'group/:groupId', component: GroupComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'schedule', component: ScheduleComponent },
    ],
  },
  { path: 'meeting/:uid/:groupId/:callId', component: VideoCallComponent },
  { path: '', component: MainpageComponent },
  { path: '', redirectTo: '/mainpage', pathMatch: 'full' },
  { path: '**', redirectTo: '/mainpage' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
