import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AaaComponent } from './aaa.component';

describe('AaaComponent', () => {
  let component: AaaComponent;
  let fixture: ComponentFixture<AaaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AaaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AaaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
