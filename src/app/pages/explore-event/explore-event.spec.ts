import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ExploreEvent } from './explore-event';
import { EventService } from '../../services/event-service/event.service';
import { CategoryService } from '../../services/category-services/category.service';

describe('ExploreEvent', () => {
  let component: ExploreEvent;
  let fixture: ComponentFixture<ExploreEvent>;

  const eventServiceMock = {
    getEvents: () => of([]),
  };

  const categoryServiceMock = {
    getCategories: () => of([]),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreEvent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: EventService, useValue: eventServiceMock },
        { provide: CategoryService, useValue: categoryServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExploreEvent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
