import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnlimitedJoker2020Component } from './unlimited-joker-20-20.component';

describe('UnlimitedJoker2020Component', () => {
  let component: UnlimitedJoker2020Component;
  let fixture: ComponentFixture<UnlimitedJoker2020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnlimitedJoker2020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnlimitedJoker2020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
