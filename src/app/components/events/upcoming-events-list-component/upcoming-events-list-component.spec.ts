import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { UpcomingEventsListComponent } from './upcoming-events-list-component';
import { EventService } from '../../../services/event-service/event.service';
import { FeatureToggleService } from '../../../services/feature-toggle/feature-toggle.service';

describe('UpcomingEventsListComponent', () => {
  let component: UpcomingEventsListComponent;
  let fixture: ComponentFixture<UpcomingEventsListComponent>;

  const eventServiceMock = {
    getUpcomingEvents: () => of([]),
  };

  const featureToggleServiceMock = {
    isEnabled: () => true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingEventsListComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: EventService, useValue: eventServiceMock },
        { provide: FeatureToggleService, useValue: featureToggleServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingEventsListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
