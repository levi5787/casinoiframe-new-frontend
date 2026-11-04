import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cmatch20Component } from './cmatch20.component';

describe('Cmatch20Component', () => {
  let component: Cmatch20Component;
  let fixture: ComponentFixture<Cmatch20Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cmatch20Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cmatch20Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
