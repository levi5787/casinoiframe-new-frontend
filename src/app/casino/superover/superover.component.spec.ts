import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperoverComponent } from './superover.component';

describe('SuperoverComponent', () => {
  let component: SuperoverComponent;
  let fixture: ComponentFixture<SuperoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperoverComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
