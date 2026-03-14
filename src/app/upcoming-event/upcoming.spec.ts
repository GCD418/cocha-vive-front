import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpcomingEventComponent } from './upcoming';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { EventService } from '../event-service'; 

// Simulamos el EventService para que las pruebas no hagan peticiones reales al backend
class MockEventService {
  getEvents() {
    return of([]); // Retorna un array vacío simulando la respuesta exitosa
  }
}

describe('UpcomingEventComponent', () => {
  let component: UpcomingEventComponent;
  let fixture: ComponentFixture<UpcomingEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingEventComponent],
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
    
    fixture = TestBed.createComponent(UpcomingEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});