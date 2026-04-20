import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { HomeComponent } from './home';
import { EventService } from '../../services/event-service/event.service';
import { CategoryService } from '../../services/category-services/category.service';
import { FeatureToggleService } from '../../services/feature-toggle/feature-toggle.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  const eventServiceMock = {
    getFeaturedEvents: () => of([]),
    getUpcomingEvents: () => of([]),
    getEvents: () => of([]),
  };

  const categoryServiceMock = {
    getCategories: () => of([]),
  };

  const featureToggleServiceMock = {
    isEnabled: () => true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: EventService, useValue: eventServiceMock },
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: FeatureToggleService, useValue: featureToggleServiceMock },
      ],
    });

    TestBed.overrideComponent(HomeComponent, {
      set: { template: '' }
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be configured as standalone component', () => {
    const componentMetadata = (HomeComponent as any).ɵcmp;
    expect(componentMetadata).toBeTruthy();
    expect(componentMetadata.standalone).toBeTruthy();
  });
});
