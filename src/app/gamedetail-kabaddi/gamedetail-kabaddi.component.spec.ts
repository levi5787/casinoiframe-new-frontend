import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamedetailKabaddiComponent } from './gamedetail-kabaddi.component';

describe('GamedetailKabaddiComponent', () => {
  let component: GamedetailKabaddiComponent;
  let fixture: ComponentFixture<GamedetailKabaddiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamedetailKabaddiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamedetailKabaddiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
