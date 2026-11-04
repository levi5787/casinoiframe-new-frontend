import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Teen120Component } from './teen120.component';

describe('Teen120Component', () => {
  let component: Teen120Component;
  let fixture: ComponentFixture<Teen120Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Teen120Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Teen120Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
