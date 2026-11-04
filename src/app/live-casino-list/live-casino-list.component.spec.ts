import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveCasinoListComponent } from './live-casino-list.component';

describe('LiveCasinoListComponent', () => {
  let component: LiveCasinoListComponent;
  let fixture: ComponentFixture<LiveCasinoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveCasinoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveCasinoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
