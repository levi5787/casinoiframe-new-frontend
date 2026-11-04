import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneCardOneDayComponent } from './one-card-one-day.component';

describe('OneCardOneDayComponent', () => {
  let component: OneCardOneDayComponent;
  let fixture: ComponentFixture<OneCardOneDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OneCardOneDayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OneCardOneDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
