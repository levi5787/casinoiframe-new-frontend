import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lucky7eu2Component } from './lucky7eu2.component';

describe('Lucky7eu2Component', () => {
  let component: Lucky7eu2Component;
  let fixture: ComponentFixture<Lucky7eu2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lucky7eu2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lucky7eu2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
