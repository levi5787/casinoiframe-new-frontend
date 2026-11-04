import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Card32aComponent } from './card32a.component';

describe('Card32aComponent', () => {
  let component: Card32aComponent;
  let fixture: ComponentFixture<Card32aComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Card32aComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Card32aComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
