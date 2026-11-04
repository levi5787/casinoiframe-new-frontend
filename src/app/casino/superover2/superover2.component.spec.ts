import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Superover2Component } from './superover2.component';

describe('Superover2Component', () => {
  let component: Superover2Component;
  let fixture: ComponentFixture<Superover2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Superover2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Superover2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
