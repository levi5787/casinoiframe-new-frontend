import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtableComponent } from './btable.component';

describe('BtableComponent', () => {
  let component: BtableComponent;
  let fixture: ComponentFixture<BtableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
