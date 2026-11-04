import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sicbo2Component } from './sicbo2.component';

describe('Sicbo2Component', () => {
  let component: Sicbo2Component;
  let fixture: ComponentFixture<Sicbo2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sicbo2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sicbo2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
