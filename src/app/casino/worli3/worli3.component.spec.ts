import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Worli3Component } from './worli3.component';

describe('Worli3Component', () => {
  let component: Worli3Component;
  let fixture: ComponentFixture<Worli3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Worli3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Worli3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
