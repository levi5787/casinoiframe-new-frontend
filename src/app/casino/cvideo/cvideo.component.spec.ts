import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvideoComponent } from './cvideo.component';

describe('CvideoComponent', () => {
  let component: CvideoComponent;
  let fixture: ComponentFixture<CvideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvideoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CvideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
