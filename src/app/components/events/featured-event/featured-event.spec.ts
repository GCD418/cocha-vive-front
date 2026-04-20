import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturedEventComponent } from './featured-event';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { EventService } from '../../../services/event-service/event.service'; 
import { TranslateModule } from '@ngx-translate/core';
import { FeatureToggleService } from '../../../services/feature-toggle/feature-toggle.service';

// Simulamos el EventService para que las pruebas no hagan peticiones reales al backend
class MockEventService {
  getFeaturedEvents() {
    return of([]); // Retorna un array vacío simulando la respuesta exitosa
  }
}

const featureToggleServiceMock = {
  isEnabled: () => true,
};

describe('FeaturedEventComponent', () => {
  let component: FeaturedEventComponent;
  let fixture: ComponentFixture<FeaturedEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedEventComponent, TranslateModule.forRoot()],
      providers: [
        // Le decimos a Angular que cuando el componente pida EventService, use el Mock
        { provide: EventService, useClass: MockEventService },
        { provide: FeatureToggleService, useValue: featureToggleServiceMock },
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
