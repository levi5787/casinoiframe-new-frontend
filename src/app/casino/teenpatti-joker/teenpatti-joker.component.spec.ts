import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeenpattiJokerComponent } from './teenpatti-joker.component';

describe('TeenpattiJokerComponent', () => {
  let component: TeenpattiJokerComponent;
  let fixture: ComponentFixture<TeenpattiJokerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeenpattiJokerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeenpattiJokerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
