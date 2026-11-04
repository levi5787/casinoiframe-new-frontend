import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositStatementComponent } from './deposit-statement.component';

describe('DepositStatementComponent', () => {
  let component: DepositStatementComponent;
  let fixture: ComponentFixture<DepositStatementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepositStatementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepositStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
