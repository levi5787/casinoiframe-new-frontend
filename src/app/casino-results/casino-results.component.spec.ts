import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasinoResultsComponent } from './casino-results.component';

describe('CasinoResultsComponent', () => {
  let component: CasinoResultsComponent;
  let fixture: ComponentFixture<CasinoResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CasinoResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CasinoResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
