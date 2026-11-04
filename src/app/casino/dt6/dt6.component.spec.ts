import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dt6Component } from './dt6.component';

describe('Dt6Component', () => {
  let component: Dt6Component;
  let fixture: ComponentFixture<Dt6Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dt6Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dt6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
