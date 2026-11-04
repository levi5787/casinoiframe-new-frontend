import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Poker6Component } from './poker6.component';

describe('Poker6Component', () => {
  let component: Poker6Component;
  let fixture: ComponentFixture<Poker6Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Poker6Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Poker6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
