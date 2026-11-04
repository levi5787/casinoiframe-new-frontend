import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnlimitedJokerOnedayComponent } from './unlimited-joker-oneday.component';

describe('UnlimitedJokerOnedayComponent', () => {
  let component: UnlimitedJokerOnedayComponent;
  let fixture: ComponentFixture<UnlimitedJokerOnedayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnlimitedJokerOnedayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnlimitedJokerOnedayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
