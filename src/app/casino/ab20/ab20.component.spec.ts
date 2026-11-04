import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ab20Component } from './ab20.component';

describe('Ab20Component', () => {
  let component: Ab20Component;
  let fixture: ComponentFixture<Ab20Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ab20Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ab20Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
