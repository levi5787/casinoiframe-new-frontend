import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorliComponent } from './worli.component';

describe('WorliComponent', () => {
  let component: WorliComponent;
  let fixture: ComponentFixture<WorliComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorliComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
