import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Teen62Component } from './teen62.component';

describe('Teen62Component', () => {
  let component: Teen62Component;
  let fixture: ComponentFixture<Teen62Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Teen62Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Teen62Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
