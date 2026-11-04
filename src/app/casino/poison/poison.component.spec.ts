import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoisonComponent } from './poison.component';

describe('PoisonComponent', () => {
  let component: PoisonComponent;
  let fixture: ComponentFixture<PoisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoisonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
