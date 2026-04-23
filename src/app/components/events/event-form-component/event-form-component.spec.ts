import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { EventFormComponent } from './event-form-component';
import { EventService } from '../../../services/event-service/event.service';

describe('EventFormComponent', () => {
  let component: EventFormComponent;
  let fixture: ComponentFixture<EventFormComponent>;

  const eventServiceMock = {
    getCategories: () => of([]),
    createEvent: () => of({}),
    updateEvent: () => of({}),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventFormComponent, TranslateModule.forRoot()],
      providers: [{ provide: EventService, useValue: eventServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(EventFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
