import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ab4Component } from './ab4.component';

describe('Ab4Component', () => {
  let component: Ab4Component;
  let fixture: ComponentFixture<Ab4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ab4Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ab4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
