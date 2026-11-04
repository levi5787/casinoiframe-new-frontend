import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Teen8Component } from './teen8.component';

describe('Teen8Component', () => {
  let component: Teen8Component;
  let fixture: ComponentFixture<Teen8Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Teen8Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Teen8Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
