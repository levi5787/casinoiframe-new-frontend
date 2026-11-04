import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Teen42Component } from './teen42.component';

describe('Teen42Component', () => {
  let component: Teen42Component;
  let fixture: ComponentFixture<Teen42Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Teen42Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Teen42Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
