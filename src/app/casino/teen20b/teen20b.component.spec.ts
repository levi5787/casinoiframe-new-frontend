import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Teen20bComponent } from './teen20b.component';

describe('Teen20bComponent', () => {
  let component: Teen20bComponent;
  let fixture: ComponentFixture<Teen20bComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Teen20bComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Teen20bComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
