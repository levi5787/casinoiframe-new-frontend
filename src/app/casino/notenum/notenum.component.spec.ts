import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotenumComponent } from './notenum.component';

describe('NotenumComponent', () => {
  let component: NotenumComponent;
  let fixture: ComponentFixture<NotenumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotenumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotenumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
