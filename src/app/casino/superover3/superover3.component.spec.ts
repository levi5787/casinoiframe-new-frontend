import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Superover3Component } from './superover3.component';

describe('Superover3Component', () => {
  let component: Superover3Component;
  let fixture: ComponentFixture<Superover3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Superover3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Superover3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
