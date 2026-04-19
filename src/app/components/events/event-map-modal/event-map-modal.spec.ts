import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { EventMapModalComponent } from './event-map-modal';

describe('EventMapModalComponent', () => {
  let component: EventMapModalComponent;
  let fixture: ComponentFixture<EventMapModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventMapModalComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(EventMapModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
