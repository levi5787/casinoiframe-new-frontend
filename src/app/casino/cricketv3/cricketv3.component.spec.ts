import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cricketv3Component } from './cricketv3.component';

describe('Cricketv3Component', () => {
  let component: Cricketv3Component;
  let fixture: ComponentFixture<Cricketv3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cricketv3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cricketv3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
