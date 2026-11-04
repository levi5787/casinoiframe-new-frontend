import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Race20Component } from './race20.component';

describe('Race20Component', () => {
  let component: Race20Component;
  let fixture: ComponentFixture<Race20Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Race20Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Race20Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
