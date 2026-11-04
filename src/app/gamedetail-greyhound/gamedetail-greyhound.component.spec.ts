import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamedetailGreyhoundComponent } from './gamedetail-greyhound.component';

describe('GamedetailGreyhoundComponent', () => {
  let component: GamedetailGreyhoundComponent;
  let fixture: ComponentFixture<GamedetailGreyhoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamedetailGreyhoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamedetailGreyhoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
