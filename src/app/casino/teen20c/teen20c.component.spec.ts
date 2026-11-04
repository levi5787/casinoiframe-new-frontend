import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Teen20cComponent } from './teen20c.component';

describe('Teen20cComponent', () => {
  let component: Teen20cComponent;
  let fixture: ComponentFixture<Teen20cComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Teen20cComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Teen20cComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
