import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Btable2Component } from './btable2.component';

describe('Btable2Component', () => {
  let component: Btable2Component;
  let fixture: ComponentFixture<Btable2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Btable2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Btable2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
