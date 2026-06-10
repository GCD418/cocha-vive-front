import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturedEventComponent } from './featured-event';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { EventService } from '../../../services/event-service/event.service';
import { TranslateModule } from '@ngx-translate/core';

class MockEventService {
  getFeaturedEvents() {
    return of([]);
  }
}

describe('FeaturedEventComponent', () => {
  let component: FeaturedEventComponent;
  let fixture: ComponentFixture<FeaturedEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedEventComponent, TranslateModule.forRoot()],
      providers: [
        { provide: EventService, useClass: MockEventService },
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) }
        }
      ]
    });

    TestBed.overrideComponent(FeaturedEventComponent, {
      set: { template: '' }
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(FeaturedEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});