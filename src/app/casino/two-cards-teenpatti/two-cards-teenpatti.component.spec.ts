import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoCardsTeenpattiComponent } from './two-cards-teenpatti.component';

describe('TwoCardsTeenpattiComponent', () => {
  let component: TwoCardsTeenpattiComponent;
  let fixture: ComponentFixture<TwoCardsTeenpattiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoCardsTeenpattiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwoCardsTeenpattiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
