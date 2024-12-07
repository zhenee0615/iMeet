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
import { FormsModule } from '@angular/forms';
import { ContactFormComponent } from './Contact Us Page/contact-form/contact-form.component';
import { MapComponent } from './Contact Us Page/map/map.component';

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
    MapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
