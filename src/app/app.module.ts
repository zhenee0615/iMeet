import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainpageComponent } from './Landing Page/mainpage/mainpage.component';
import { HeroComponent } from './Landing Page/hero/hero.component';
import { StatisticComponent } from './Landing Page/statistic/statistic.component';
import { CallOnComponent } from './Landing Page/call-on/call-on.component';
import { HeaderComponent } from './Header Footer/header/header.component';
import { FooterComponent } from './Header Footer/footer/footer.component';
import { AboutUsComponent } from './About Us Page/about-us/about-us.component';
import { DescriptionComponent } from './About Us Page/description/description.component';
import { MissionVisionComponent } from './About Us Page/mission-vision/mission-vision.component';
import { TeamComponent } from './About Us Page/team/team.component';
import { HeroSectionComponent } from './Share Components/hero-section/hero-section.component';
import { FeaturesPageComponent } from './Features Page/features-page/features-page.component';
import { FeatureHighlightsComponent } from './Features Page/feature-highlights/feature-highlights.component';
import { BenefitsComponent } from './Features Page/benefits/benefits.component';
import { CallToActionComponent } from './Features Page/call-to-action/call-to-action.component';
import { ContactUsComponent } from './Contact Us Page/contact-us/contact-us.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContactFormComponent } from './Contact Us Page/contact-form/contact-form.component';
import { MapComponent } from './Contact Us Page/map/map.component';
import { LoginComponent } from './Login & Sign Up/login/login.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogComponent } from './Contact Us Page/dialog/dialog.component';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { UserPortalComponent } from './User Portal/user-portal/user-portal.component';
import { SidePanelComponent } from './User Portal/side-panel/side-panel.component';
import { UserHeaderComponent } from './User Portal/user-header/user-header.component';
import { DashboardComponent } from './User Portal/Dashboard/dashboard/dashboard.component';
import { GroupComponent } from './User Portal/Dashboard/Group/group/group.component';
import { ProfileComponent } from './User Portal/Profile/profile/profile.component';
import { ScheduleComponent } from './User Portal/Schedule/schedule/schedule.component';
import { environment } from '../environments/environment.development';
import { GroupDialogComponent } from './User Portal/Dashboard/group-dialog/group-dialog.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ProfileDialogComponent } from './User Portal/Profile/profile-dialog/profile-dialog.component';
import { MatOptionModule } from '@angular/material/core';
import { AddPostDialogComponent } from './User Portal/Dashboard/Group/add-post-dialog/add-post-dialog.component';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { VideoCallComponent } from './Video Conference/video-call/video-call.component';
import { ParticipantComponent } from './Video Conference/participant/participant.component';
import { FaceRecognitionDialogComponent } from './User Portal/Dashboard/Group/face-recognition-dialog/face-recognition-dialog.component';
import { NgxCaptchaModule } from 'ngx-captcha';

@NgModule({
  declarations: [
    AppComponent,
    MainpageComponent,
    HeroComponent,
    StatisticComponent,
    CallOnComponent,
    HeaderComponent,
    FooterComponent,
    AboutUsComponent,
    DescriptionComponent,
    MissionVisionComponent,
    TeamComponent,
    HeroSectionComponent,
    FeaturesPageComponent,
    FeatureHighlightsComponent,
    BenefitsComponent,
    CallToActionComponent,
    ContactUsComponent,
    ContactFormComponent,
    MapComponent,
    LoginComponent,
    DialogComponent,
    UserPortalComponent,
    SidePanelComponent,
    UserHeaderComponent,
    DashboardComponent,
    ProfileComponent,
    ScheduleComponent,
    GroupComponent,
    GroupDialogComponent,
    ProfileDialogComponent,
    AddPostDialogComponent,
    VideoCallComponent,
    ParticipantComponent,
    FaceRecognitionDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatDialogModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatRadioModule,
    MatInputModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatTabsModule,
    MatOptionModule,
    MatTableModule,
    AngularFireStorageModule,
    NgxCaptchaModule
  ],
  providers: [
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp(environment)),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic'
      }
    },
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
