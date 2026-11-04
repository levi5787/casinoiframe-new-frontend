import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Teen20Component } from './teen20.component';

describe('Teen20Component', () => {
  let component: Teen20Component;
  let fixture: ComponentFixture<Teen20Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Teen20Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Teen20Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
