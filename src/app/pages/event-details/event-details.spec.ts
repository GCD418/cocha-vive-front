import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';

import { EventDetails } from './event-details';
import { EventService } from '../../services/event-service/event.service';
import { EventModel } from '../../models/event-model';

describe('EventDetails', () => {
  let component: EventDetails;
  let fixture: ComponentFixture<EventDetails>;
  let eventServiceSpy: { getEventById: ReturnType<typeof vi.fn> };
  let paramMap$: BehaviorSubject<ParamMap>;

  const routerMock = { navigate: vi.fn() };

  const eventMock: EventModel = {
    id: 42,
    title: 'Concierto',
    shortDescription: 'Short',
    description: 'Long',
    cost: 10,
    categoryId: 1,
    categoryName: 'Música',
    organizedByUserId: 5,
    organizedByUserName: 'Luis Rojas',
    latitude: -17.39,
    longitude: -66.15,
    shortPlaceDescription: 'Cochabamba',
    peopleCapacity: 200,
    tags: [],
    photoLinks: [],
    eventStatus: 'APPROVED',
    createdAt: '2026-01-01T00:00:00Z',
    isActive: true,
    dateStart: '2026-06-01T18:00:00Z',
    dateEnd: '2026-06-01T20:00:00Z',
    isFeatured: false,
    promotionType: null,
    promotionSlot: null,
    expiresAt: null,
  };

  beforeEach(async () => {
    eventServiceSpy = {
      getEventById: vi.fn().mockReturnValue(of(eventMock)),
    };
    paramMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({}));

    await TestBed.configureTestingModule({
      imports: [EventDetails],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    TestBed.overrideComponent(EventDetails, { set: { template: '' } });

    fixture = TestBed.createComponent(EventDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load event data using route id signal', async () => {
    paramMap$.next(convertToParamMap({ id: '42' }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(eventServiceSpy.getEventById).toHaveBeenCalledWith(42);
    expect(component.event()?.id).toBe(42);
    expect(component.event()?.title).toBe('Concierto');
  });

  it('should navigate back to explore events page', () => {
    component.goBack();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/explore-events']);
  });
});