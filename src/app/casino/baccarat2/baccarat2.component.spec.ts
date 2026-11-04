import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Baccarat2Component } from './baccarat2.component';

describe('Baccarat2Component', () => {
  let component: Baccarat2Component;
  let fixture: ComponentFixture<Baccarat2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Baccarat2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Baccarat2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
