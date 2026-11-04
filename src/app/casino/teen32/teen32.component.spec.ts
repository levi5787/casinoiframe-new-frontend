import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Teen32Component } from './teen32.component';

describe('Teen32Component', () => {
  let component: Teen32Component;
  let fixture: ComponentFixture<Teen32Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Teen32Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Teen32Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
