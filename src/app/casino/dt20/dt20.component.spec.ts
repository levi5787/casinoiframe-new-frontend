import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dt20Component } from './dt20.component';

describe('Dt20Component', () => {
  let component: Dt20Component;
  let fixture: ComponentFixture<Dt20Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dt20Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dt20Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
