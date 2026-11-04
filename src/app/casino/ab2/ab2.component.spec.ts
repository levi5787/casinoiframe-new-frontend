import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ab2Component } from './ab2.component';

describe('Ab2Component', () => {
  let component: Ab2Component;
  let fixture: ComponentFixture<Ab2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ab2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ab2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
