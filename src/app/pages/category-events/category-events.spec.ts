import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { CategoryEventsComponent } from './category-events';
import { CategoryService } from '../../services/category-services/category.service';
import { EventService } from '../../services/event-service/event.service';
import { EventModel } from '../../models/event-model';

describe('CategoryEventsComponent', () => {
  let component: CategoryEventsComponent;
  let fixture: ComponentFixture<CategoryEventsComponent>;
  let categoryServiceSpy: { getCategoryByName: ReturnType<typeof vi.fn> };
  let eventServiceSpy: { getEventsByCategory: ReturnType<typeof vi.fn> };

  const createEvent = (id: number, dateStart: string): EventModel => ({
    id,
    title: `Evento ${id}`,
    shortDescription: 'Short',
    description: 'Long',
    cost: 0,
    category: { id: 1, name: 'Music', description: 'desc', identifyingIcon: 'icon' },
    organizedByUser: { id: 1, names: 'Ana', firstLastName: 'Diaz' },
    latitude: -17.4,
    longitude: -66.1,
    shortPlaceDescription: 'Cochabamba',
    tags: [],
    photoLinks: [],
    eventStatus: 'APPROVED',
    createdAt: '2026-01-01T00:00:00Z',
    isActive: true,
    dateStart,
    dateEnd: '2026-05-10T12:00:00Z'
  });

  beforeEach(async () => {
    categoryServiceSpy = {
      getCategoryByName: vi.fn()
    };
    eventServiceSpy = {
      getEventsByCategory: vi.fn()
    };

    categoryServiceSpy.getCategoryByName.mockReturnValue(
      of({ id: 1, name: 'music', description: 'desc', identifyingIcon: 'icon' })
    );
    eventServiceSpy.getEventsByCategory.mockReturnValue(of([]));

    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [CategoryEventsComponent],
      providers: [
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: EventService, useValue: eventServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ name: 'music' })
          }
        }
      ]
    }).compileComponents();

    TestBed.overrideComponent(CategoryEventsComponent, {
      set: { template: '' }
    });

    fixture = TestBed.createComponent(CategoryEventsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load category events from route name and sort them by start date', () => {
    const later = createEvent(2, '2026-06-10T10:00:00Z');
    const earlier = createEvent(1, '2026-05-10T10:00:00Z');

    categoryServiceSpy.getCategoryByName.mockReturnValue(
      of({ id: 5, name: 'music', description: 'desc', identifyingIcon: 'icon' })
    );
    eventServiceSpy.getEventsByCategory.mockReturnValue(of([later, earlier]));

    component.loadData('music');

    expect(categoryServiceSpy.getCategoryByName).toHaveBeenCalledWith('music');
    expect(eventServiceSpy.getEventsByCategory).toHaveBeenCalledWith(5);
    expect(component.events().map((event) => event.id)).toEqual([1, 2]);
    expect(component.loading()).toBeFalsy();
    expect(component.errorLoading()).toBeFalsy();
  });

  it('should derive paginated events and move between pages', () => {
    const events = Array.from({ length: 18 }, (_, index) =>
      createEvent(index + 1, `2026-05-${String((index % 28) + 1).padStart(2, '0')}T10:00:00Z`)
    );
    component.events.set(events);

    expect(component.totalPages()).toBe(2);
    expect(component.paginatedEvents().length).toBe(16);
    expect(component.paginatedEvents()[0].id).toBe(1);

    component.nextPage();
    expect(component.currentPage()).toBe(2);
    expect(component.paginatedEvents().length).toBe(2);
    expect(component.paginatedEvents()[0].id).toBe(17);

    component.prevPage();
    expect(component.currentPage()).toBe(1);
  });
});
