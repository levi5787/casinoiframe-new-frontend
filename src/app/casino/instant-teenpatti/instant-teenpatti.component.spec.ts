import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstantTeenpattiComponent } from './instant-teenpatti.component';

describe('InstantTeenpattiComponent', () => {
  let component: InstantTeenpattiComponent;
  let fixture: ComponentFixture<InstantTeenpattiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstantTeenpattiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstantTeenpattiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
