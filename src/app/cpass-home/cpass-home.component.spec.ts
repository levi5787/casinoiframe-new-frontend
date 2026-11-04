import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpassHomeComponent } from './cpass-home.component';

describe('CpassHomeComponent', () => {
  let component: CpassHomeComponent;
  let fixture: ComponentFixture<CpassHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpassHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpassHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
