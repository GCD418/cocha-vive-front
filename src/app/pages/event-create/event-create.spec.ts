import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { EventCreate } from './event-create';
import { EventService } from '../../services/event-service/event.service';

describe('EventCreate', () => {
  let component: EventCreate;
  let fixture: ComponentFixture<EventCreate>;

  const eventServiceMock = {
    getCategories: () => of([]),
    createEvent: () => of({}),
    updateEvent: () => of({}),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCreate, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: EventService, useValue: eventServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
