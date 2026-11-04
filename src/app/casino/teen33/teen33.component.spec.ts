import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Teen33Component } from './teen33.component';

describe('Teen33Component', () => {
  let component: Teen33Component;
  let fixture: ComponentFixture<Teen33Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Teen33Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Teen33Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
