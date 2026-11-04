import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Worli2Component } from './worli2.component';

describe('Worli2Component', () => {
  let component: Worli2Component;
  let fixture: ComponentFixture<Worli2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Worli2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Worli2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
