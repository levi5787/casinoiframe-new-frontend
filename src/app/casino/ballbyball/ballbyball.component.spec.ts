import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BallbyballComponent } from './ballbyball.component';

describe('BallbyballComponent', () => {
  let component: BallbyballComponent;
  let fixture: ComponentFixture<BallbyballComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BallbyballComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BallbyballComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
