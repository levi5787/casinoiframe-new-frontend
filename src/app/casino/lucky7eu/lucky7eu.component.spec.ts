import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lucky7euComponent } from './lucky7eu.component';

describe('Lucky7euComponent', () => {
  let component: Lucky7euComponent;
  let fixture: ComponentFixture<Lucky7euComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lucky7euComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lucky7euComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
