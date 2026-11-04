import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeensinComponent } from './teensin.component';

describe('TeensinComponent', () => {
  let component: TeensinComponent;
  let fixture: ComponentFixture<TeensinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeensinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeensinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
