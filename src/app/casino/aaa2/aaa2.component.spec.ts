import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Aaa2Component } from './aaa2.component';

describe('Aaa2Component', () => {
  let component: Aaa2Component;
  let fixture: ComponentFixture<Aaa2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Aaa2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Aaa2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
