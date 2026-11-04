import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmeterComponent } from './cmeter.component';

describe('CmeterComponent', () => {
  let component: CmeterComponent;
  let fixture: ComponentFixture<CmeterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CmeterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CmeterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
