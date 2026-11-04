import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Teen6Component } from './teen6.component';

describe('Teen6Component', () => {
  let component: Teen6Component;
  let fixture: ComponentFixture<Teen6Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Teen6Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Teen6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
