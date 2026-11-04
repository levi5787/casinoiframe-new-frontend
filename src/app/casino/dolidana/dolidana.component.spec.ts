import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DolidanaComponent } from './dolidana.component';

describe('DolidanaComponent', () => {
  let component: DolidanaComponent;
  let fixture: ComponentFixture<DolidanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DolidanaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DolidanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
