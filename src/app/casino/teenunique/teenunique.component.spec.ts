import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeenuniqueComponent } from './teenunique.component';

describe('TeenuniqueComponent', () => {
  let component: TeenuniqueComponent;
  let fixture: ComponentFixture<TeenuniqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeenuniqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeenuniqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
