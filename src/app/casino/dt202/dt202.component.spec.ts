import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dt202Component } from './dt202.component';

describe('Dt202Component', () => {
  let component: Dt202Component;
  let fixture: ComponentFixture<Dt202Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dt202Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dt202Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
