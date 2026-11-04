import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Race17Component } from './race17.component';

describe('Race17Component', () => {
  let component: Race17Component;
  let fixture: ComponentFixture<Race17Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Race17Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Race17Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
