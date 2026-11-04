import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Card32bComponent } from './card32b.component';

describe('Card32bComponent', () => {
  let component: Card32bComponent;
  let fixture: ComponentFixture<Card32bComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Card32bComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Card32bComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
