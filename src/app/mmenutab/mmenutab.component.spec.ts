import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MmenutabComponent } from './mmenutab.component';

describe('MmenutabComponent', () => {
  let component: MmenutabComponent;
  let fixture: ComponentFixture<MmenutabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MmenutabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MmenutabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
