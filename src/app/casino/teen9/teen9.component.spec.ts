import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Teen9Component } from './teen9.component';

describe('Teen9Component', () => {
  let component: Teen9Component;
  let fixture: ComponentFixture<Teen9Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Teen9Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Teen9Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
