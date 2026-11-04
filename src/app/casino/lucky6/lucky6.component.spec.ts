import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lucky6Component } from './lucky6.component';

describe('Lucky6Component', () => {
  let component: Lucky6Component;
  let fixture: ComponentFixture<Lucky6Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lucky6Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lucky6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
