import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamedetailTennisComponent } from './gamedetail-tennis.component';

describe('GamedetailTennisComponent', () => {
  let component: GamedetailTennisComponent;
  let fixture: ComponentFixture<GamedetailTennisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamedetailTennisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamedetailTennisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
