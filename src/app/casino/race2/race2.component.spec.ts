import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Race2Component } from './race2.component';

describe('Race2Component', () => {
  let component: Race2Component;
  let fixture: ComponentFixture<Race2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Race2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Race2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
