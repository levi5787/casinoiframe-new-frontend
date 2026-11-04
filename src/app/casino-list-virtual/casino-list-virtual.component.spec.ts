import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasinoListVirtualComponent } from './casino-list-virtual.component';

describe('CasinoListVirtualComponent', () => {
  let component: CasinoListVirtualComponent;
  let fixture: ComponentFixture<CasinoListVirtualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CasinoListVirtualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CasinoListVirtualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
