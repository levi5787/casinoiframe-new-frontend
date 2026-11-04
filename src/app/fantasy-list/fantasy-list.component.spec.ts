import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FantasyListComponent } from './fantasy-list.component';

describe('FantasyListComponent', () => {
  let component: FantasyListComponent;
  let fixture: ComponentFixture<FantasyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FantasyListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FantasyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
