import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { EventMapPickerComponent } from './event-map-picker';

describe('EventMapPickerComponent', () => {
  let component: EventMapPickerComponent;
  let fixture: ComponentFixture<EventMapPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventMapPickerComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(EventMapPickerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
