import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamedetailFootballComponent } from './gamedetail-football.component';

describe('GamedetailFootballComponent', () => {
  let component: GamedetailFootballComponent;
  let fixture: ComponentFixture<GamedetailFootballComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamedetailFootballComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamedetailFootballComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
