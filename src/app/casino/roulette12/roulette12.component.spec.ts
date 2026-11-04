import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Roulette12Component } from './roulette12.component';

describe('Roulette12Component', () => {
  let component: Roulette12Component;
  let fixture: ComponentFixture<Roulette12Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Roulette12Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Roulette12Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
