import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LottcardComponent } from './lottcard.component';

describe('LottcardComponent', () => {
  let component: LottcardComponent;
  let fixture: ComponentFixture<LottcardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LottcardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LottcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
