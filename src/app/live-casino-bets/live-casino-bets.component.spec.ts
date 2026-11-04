import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveCasinoBetsComponent } from './live-casino-bets.component';

describe('LiveCasinoBetsComponent', () => {
  let component: LiveCasinoBetsComponent;
  let fixture: ComponentFixture<LiveCasinoBetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveCasinoBetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveCasinoBetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
