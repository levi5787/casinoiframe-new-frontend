import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualCricketComponent } from './virtual-cricket.component';

describe('VirtualCricketComponent', () => {
  let component: VirtualCricketComponent;
  let fixture: ComponentFixture<VirtualCricketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualCricketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirtualCricketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
