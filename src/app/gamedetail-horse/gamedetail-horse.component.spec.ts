import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamedetailHorseComponent } from './gamedetail-horse.component';

describe('GamedetailHorseComponent', () => {
  let component: GamedetailHorseComponent;
  let fixture: ComponentFixture<GamedetailHorseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamedetailHorseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamedetailHorseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
