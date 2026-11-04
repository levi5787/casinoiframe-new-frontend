import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mac88Component } from './mac88.component';

describe('Mac88Component', () => {
  let component: Mac88Component;
  let fixture: ComponentFixture<Mac88Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mac88Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mac88Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
