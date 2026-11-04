import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dum10Component } from './dum10.component';

describe('Dum10Component', () => {
  let component: Dum10Component;
  let fixture: ComponentFixture<Dum10Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dum10Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dum10Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
