import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Poker20Component } from './poker20.component';

describe('Poker20Component', () => {
  let component: Poker20Component;
  let fixture: ComponentFixture<Poker20Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Poker20Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Poker20Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
