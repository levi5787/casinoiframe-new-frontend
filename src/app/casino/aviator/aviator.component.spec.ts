import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AviatorComponent } from './aviator.component';

describe('AviatorComponent', () => {
  let component: AviatorComponent;
  let fixture: ComponentFixture<AviatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AviatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AviatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
