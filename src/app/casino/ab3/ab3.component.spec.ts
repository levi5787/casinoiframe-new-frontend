import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ab3Component } from './ab3.component';

describe('Ab3Component', () => {
  let component: Ab3Component;
  let fixture: ComponentFixture<Ab3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ab3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ab3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
