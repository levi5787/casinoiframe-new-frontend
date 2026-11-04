import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeenmufComponent } from './teenmuf.component';

describe('TeenmufComponent', () => {
  let component: TeenmufComponent;
  let fixture: ComponentFixture<TeenmufComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeenmufComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeenmufComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
