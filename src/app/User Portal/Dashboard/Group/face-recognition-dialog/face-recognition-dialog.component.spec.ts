import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceRecognitionDialogComponent } from './face-recognition-dialog.component';

describe('FaceRecognitionDialogComponent', () => {
  let component: FaceRecognitionDialogComponent;
  let fixture: ComponentFixture<FaceRecognitionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FaceRecognitionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceRecognitionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
