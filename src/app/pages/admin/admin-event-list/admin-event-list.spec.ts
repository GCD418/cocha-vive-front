import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AdminEventListComponent } from './admin-event-list';
import { EventService } from '../../../services/event-service/event.service';

describe('AdminEventListComponent', () => {
  let component: AdminEventListComponent;
  let fixture: ComponentFixture<AdminEventListComponent>;

  const eventServiceMock = {
    getAllEventsForAdmin: () => of([]),
    approveEvent: () => of(void 0),
    rejectEvent: () => of(void 0),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEventListComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: EventService, useValue: eventServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminEventListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
