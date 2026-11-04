import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurroulleteComponent } from './ourroullete.component';

describe('OurroulleteComponent', () => {
  let component: OurroulleteComponent;
  let fixture: ComponentFixture<OurroulleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurroulleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurroulleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
