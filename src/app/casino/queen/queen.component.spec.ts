import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueenComponent } from './queen.component';

describe('QueenComponent', () => {
  let component: QueenComponent;
  let fixture: ComponentFixture<QueenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
