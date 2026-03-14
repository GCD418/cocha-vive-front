import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturedEventComponent } from './featured-event';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { EventService } from '../event-service'; 

// Simulamos el EventService para que las pruebas no hagan peticiones reales al backend
class MockEventService {
  getEvents() {
    return of([]); // Retorna un array vacío simulando la respuesta exitosa
  }
}

describe('FeaturedEventComponent', () => {
  let component: FeaturedEventComponent;
  let fixture: ComponentFixture<FeaturedEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedEventComponent],
      providers: [
        // Le decimos a Angular que cuando el componente pida EventService, use el Mock
        { provide: EventService, useClass: MockEventService },
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) }
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeaturedEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});