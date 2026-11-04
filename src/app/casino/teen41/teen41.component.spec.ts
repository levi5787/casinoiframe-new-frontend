import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Teen41Component } from './teen41.component';

describe('Teen41Component', () => {
  let component: Teen41Component;
  let fixture: ComponentFixture<Teen41Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Teen41Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Teen41Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
