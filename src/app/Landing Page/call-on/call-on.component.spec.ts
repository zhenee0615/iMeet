import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallOnComponent } from './call-on.component';

describe('CallOnComponent', () => {
  let component: CallOnComponent;
  let fixture: ComponentFixture<CallOnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CallOnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallOnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
