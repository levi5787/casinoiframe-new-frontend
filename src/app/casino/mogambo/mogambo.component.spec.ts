import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MogamboComponent } from './mogambo.component';

describe('MogamboComponent', () => {
  let component: MogamboComponent;
  let fixture: ComponentFixture<MogamboComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MogamboComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MogamboComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
