import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamedetailPoliticsComponent } from './gamedetail-politics.component';

describe('GamedetailPoliticsComponent', () => {
  let component: GamedetailPoliticsComponent;
  let fixture: ComponentFixture<GamedetailPoliticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamedetailPoliticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamedetailPoliticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
