import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cmeter1Component } from './cmeter1.component';

describe('Cmeter1Component', () => {
  let component: Cmeter1Component;
  let fixture: ComponentFixture<Cmeter1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cmeter1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cmeter1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
