import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Roulette13Component } from './roulette13.component';

describe('Roulette13Component', () => {
  let component: Roulette13Component;
  let fixture: ComponentFixture<Roulette13Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Roulette13Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Roulette13Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
