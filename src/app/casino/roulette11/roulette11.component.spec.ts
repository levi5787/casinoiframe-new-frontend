import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Roulette11Component } from './roulette11.component';

describe('Roulette11Component', () => {
  let component: Roulette11Component;
  let fixture: ComponentFixture<Roulette11Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Roulette11Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Roulette11Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
