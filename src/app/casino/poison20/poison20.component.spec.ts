import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Poison20Component } from './poison20.component';

describe('Poison20Component', () => {
  let component: Poison20Component;
  let fixture: ComponentFixture<Poison20Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Poison20Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Poison20Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
