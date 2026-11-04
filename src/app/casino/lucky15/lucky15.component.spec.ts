import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lucky15Component } from './lucky15.component';

describe('Lucky15Component', () => {
  let component: Lucky15Component;
  let fixture: ComponentFixture<Lucky15Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lucky15Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lucky15Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
