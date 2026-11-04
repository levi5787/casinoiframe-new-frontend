import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dtl20Component } from './dtl20.component';

describe('Dtl20Component', () => {
  let component: Dtl20Component;
  let fixture: ComponentFixture<Dtl20Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dtl20Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dtl20Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
