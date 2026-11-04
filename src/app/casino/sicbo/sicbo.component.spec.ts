import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SicboComponent } from './sicbo.component';

describe('SicboComponent', () => {
  let component: SicboComponent;
  let fixture: ComponentFixture<SicboComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SicboComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SicboComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
