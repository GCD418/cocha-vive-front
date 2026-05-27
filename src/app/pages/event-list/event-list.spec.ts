import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { EventList } from './event-list';
import { EventService } from '../../services/event-service/event.service';
import { AuthService } from '../../services/auth/auth.service';
import { EventModel } from '../../models/event-model';

describe('EventList', () => {
  let component: EventList;
  let fixture: ComponentFixture<EventList>;
  let eventServiceSpy: { getMyEvents: ReturnType<typeof vi.fn>; cancelEvent: ReturnType<typeof vi.fn> };

  const routerSpy = { navigate: vi.fn() };

  const authServiceMock = {
    actualRole: () => 'ROLE_PUBLISHER',
    getCurrentUser: () => of({
      id: 99,
      names: 'Ana',
      firstLastName: 'Perez',
      email: 'ana@test.com',
      role: 'ROLE_PUBLISHER',
    }),
    isAuthenticated: () => true,
    isLoggedIn: () => true,
  };

  const createEvent = (id: number, overrides: Partial<EventModel> = {}): EventModel => ({
    id,
    title: `Evento ${id}`,
    shortDescription: 'Desc corta',
    description: 'Desc larga',
    cost: 0,
    categoryId: 1,
    categoryName: 'Música',
    organizedByUserId: 1,
    organizedByUserName: 'User Test',
    latitude: -17.39,
    longitude: -66.15,
    shortPlaceDescription: 'Cochabamba',
    peopleCapacity: 100,
    tags: [],
    photoLinks: [],
    eventStatus: 'APPROVED',
    createdAt: '2026-01-01T00:00:00Z',
    isActive: true,
    dateStart: '2026-04-01T00:00:00Z',
    dateEnd: '2026-04-01T02:00:00Z',
    isFeatured: false,
    promotionType: null,
    promotionSlot: null,
    expiresAt: null,
    ...overrides,
  });

  beforeEach(async () => {
    eventServiceSpy = {
      getMyEvents: vi.fn().mockReturnValue(of([])),
      cancelEvent: vi.fn().mockReturnValue(of(void 0)),
    };

    await TestBed.configureTestingModule({
      imports: [EventList],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    TestBed.overrideComponent(EventList, { set: { template: '' } });

    fixture = TestBed.createComponent(EventList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply filters and reset pagination on filter change', () => {
    const events = [
      createEvent(1, {
        title: 'Festival de Rock',
        cost: 20,
        eventStatus: 'APPROVED',
        categoryName: 'Música',
        dateStart: '2026-05-10T10:00:00Z',
      }),
      createEvent(2, {
        title: 'Feria Tech',
        cost: 0,
        eventStatus: 'PENDING',
        categoryName: 'Tecnología',
        dateStart: '2026-05-11T10:00:00Z',
      }),
    ];

    component.events.set(events);
    component.currentPage.set(3);

    component.searchText.set('rock');
    component.filterType.set('de-pago');
    component.filterStatus.set('APPROVED');
    component.filterCategory.set('Música');
    component.filterDateFrom.set('2026-05-01');
    component.filterDateTo.set('2026-05-15');
    component.onFilterChange();

    expect(component.currentPage()).toBe(1);
    expect(component.filteredEvents().length).toBe(1);
    expect(component.filteredEvents()[0].id).toBe(1);
  });

  it('should clear all filters and keep all events visible', () => {
    component.events.set([
      createEvent(1, { eventStatus: 'APPROVED' }),
      createEvent(2, { eventStatus: 'PENDING', categoryName: 'Tech' }),
    ]);

    component.searchText.set('abc');
    component.filterStatus.set('PENDING');
    component.filterCategory.set('Tech');
    component.filterType.set('gratis');
    component.filterDateFrom.set('2026-04-01');
    component.filterDateTo.set('2026-04-30');
    component.currentPage.set(2);
    component.clearFilters();

    expect(component.searchText()).toBe('');
    expect(component.filterStatus()).toBe('');
    expect(component.filterCategory()).toBe('');
    expect(component.filterType()).toBe('');
    expect(component.filterDateFrom()).toBe('');
    expect(component.filterDateTo()).toBe('');
    expect(component.currentPage()).toBe(1);
    expect(component.filteredEvents().length).toBe(2);
    expect(component.hasActiveFilters()).toBeFalsy();
  });

  it('should derive pagination from signals and block invalid pages', () => {
    const events = Array.from({ length: 31 }, (_, index) => createEvent(index + 1));
    component.events.set(events);

    expect(component.totalPages()).toBe(3);
    expect(component.totalPagesArray()).toEqual([1, 2, 3]);
    expect(component.pagedEvents().length).toBe(15);
    expect(component.pagedEvents()[0].id).toBe(1);

    component.goToPage(2);
    expect(component.currentPage()).toBe(2);
    expect(component.pagedEvents()[0].id).toBe(16);

    component.goToPage(999);
    expect(component.currentPage()).toBe(2);
  });

  it('should count events grouped by status', () => {
    component.events.set([
      createEvent(1, { eventStatus: 'APPROVED' }),
      createEvent(2, { eventStatus: 'APPROVED' }),
      createEvent(3, { eventStatus: 'PENDING' }),
    ]);

    expect(component.countByStatus('APPROVED')).toBe(2);
    expect(component.countByStatus('PENDING')).toBe(1);
    expect(component.countByStatus('REJECTED')).toBe(0);
  });

  it('openPromoteModal should set pendingPromoteEventId', () => {
    component.openPromoteModal(5);
    expect(component.pendingPromoteEventId()).toBe(5);
  });

  it('onPromoted should reload events', () => {
    eventServiceSpy.getMyEvents.mockReturnValue(of([createEvent(1)]));
    component.onPromoted();
    expect(eventServiceSpy.getMyEvents).toHaveBeenCalled();
  });
});