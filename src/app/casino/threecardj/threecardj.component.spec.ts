import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreecardjComponent } from './threecardj.component';

describe('ThreecardjComponent', () => {
  let component: ThreecardjComponent;
  let fixture: ComponentFixture<ThreecardjComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreecardjComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreecardjComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
