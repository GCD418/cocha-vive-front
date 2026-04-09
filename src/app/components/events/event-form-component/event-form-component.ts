import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryDTO, EventModel } from '../../../models/event-model';
import { EventService } from '../../../services/event-service/event.service';
import { TranslateModule } from '@ngx-translate/core';
import { EventMapPickerComponent } from '../../../shared/components/event-map-picker/event-map-picker';

export interface EventFormResult {
  success: boolean;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-event-form-component',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, EventMapPickerComponent],
  templateUrl: './event-form-component.html',
  styleUrl: './event-form-component.css',
})
export class EventFormComponent implements OnInit, OnChanges {

  @Input() eventToEdit: EventModel | null = null;
 
  @Output() formResult = new EventEmitter<EventFormResult>();
 
  categories: CategoryDTO[] = [];
  successMessage = false;
  errorMessage = false;
  selectedFiles: File[] = [];
  isEditMode = false;

  existingPhotos: string[] = [];
  newFiles: { file: File; previewUrl: string }[] = [];

  dragIndex: number | null = null;
  dragOver: number | null = null;
 
  form = {
    title: '',
    shortDescription: '',
    description: '',
    cost: 0,
    peopleCapacity: 0,
    shortPlaceDescription: '',
    costType: 'gratuito',
    categoryId: null as number | null,
    tags: [] as string[],
    tagInput: '',
    photoLinks: [] as string[],
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    latitude: 0,
    longitude: 0,
  };
 
  constructor(private eventService: EventService) {}
 
  ngOnInit(): void {
    this.eventService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }
 
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventToEdit'] && this.eventToEdit) {
      this.isEditMode = true;
      this.populateForm(this.eventToEdit);
    } else if (changes['eventToEdit'] && !this.eventToEdit) {
      this.isEditMode = false;
      this.resetForm();
    }
  }
 
  private populateForm(event: EventModel): void {
    const dateStart = new Date(event.dateStart);
    const dateEnd = new Date(event.dateEnd);
 
    this.form = {
      title: event.title,
      shortDescription: event.shortDescription,
      description: event.description,
      cost: event.cost > 0 ? event.cost / 100 : 0,
      peopleCapacity: 0,
      shortPlaceDescription: event.shortPlaceDescription || '',
      costType: event.cost === 0 ? 'gratuito' : 'depago',
      categoryId: event.category.id,
      tags: [...(event.tags || [])],
      tagInput: '',
      photoLinks: [...(event.photoLinks || [])],
      startDate: this.toDateInput(dateStart),
      startTime: this.toTimeInput(dateStart),
      endDate: this.toDateInput(dateEnd),
      endTime: this.toTimeInput(dateEnd),
      latitude: event.latitude,
      longitude: event.longitude,
    };

    this.existingPhotos = [...(event.photoLinks || [])];
    this.newFiles = [];
  }
 
  private toDateInput(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
 
  private toTimeInput(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }
 
  private resetForm(): void {
    this.form = {
      title: '',
      shortDescription: '',
      description: '',
      cost: 0,
      peopleCapacity: 0,
      shortPlaceDescription: '',
      costType: 'gratuito',
      categoryId: null,
      tags: [],
      tagInput: '',
      photoLinks: [],
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      latitude: 0,
      longitude: 0,
    };
    this.existingPhotos = [];
    this.newFiles = [];
  }
 
  addTag(): void {
    const tag = this.form.tagInput.trim();
    if (tag && !this.form.tags.includes(tag) && this.form.tags.length < 10) {
      this.form.tags.push(tag);
      this.form.tagInput = '';
    }
  }
 
  removeTag(tag: string): void {
    this.form.tags = this.form.tags.filter(t => t !== tag);
  }
 
  onTagKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  removeExistingPhoto(index: number): void {
    this.existingPhotos.splice(index, 1);
  }
 
  onDragStart(index: number): void {
    this.dragIndex = index;
  }
 
  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    this.dragOver = index;
  }
 
  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();
    if (this.dragIndex === null || this.dragIndex === dropIndex) {
      this.dragIndex = null;
      this.dragOver = null;
      return;
    }

    const moved = this.existingPhotos.splice(this.dragIndex, 1)[0];
    this.existingPhotos.splice(dropIndex, 0, moved);
 
    this.dragIndex = null;
    this.dragOver = null;
  }
 
  onDragEnd(): void {
    this.dragIndex = null;
    this.dragOver = null;
  }
 
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
 
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.newFiles.push({
          file,
          previewUrl: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    });
 
    input.value = '';
  }
 
  removeNewFile(index: number): void {
    this.newFiles.splice(index, 1);
  }


 
  private isFormValid(): boolean {
    return !!(
      this.form.title &&
      this.form.shortDescription &&
      this.form.description &&
      this.form.categoryId &&
      this.form.startDate &&
      this.form.startTime &&
      this.form.endDate &&
      this.form.endTime &&
      !(this.form.costType === 'depago' && this.form.cost <= 0)
    );
  }
 
  private buildPayload(): any {
    return {
      title: this.form.title,
      shortDescription: this.form.shortDescription,
      description: this.form.description,
      cost: this.form.costType === 'gratuito' ? 0 : Math.round(this.form.cost * 100),
      categoryId: this.form.categoryId,
      organizedByUserId: 1,
      latitude: this.form.latitude,
      longitude: this.form.longitude,
      shortPlaceDescription: this.form.shortPlaceDescription,
      peopleCapacity: this.form.peopleCapacity,
      dateStart: `${this.form.startDate}T${this.form.startTime}:00`,
      dateEnd: `${this.form.endDate}T${this.form.endTime}:00`,
      tags: this.form.tags,
      photoLinks: this.existingPhotos,
    };
  }

  onLocationSelected(coords: { lat: number; lng: number }): void {
    this.form.latitude = coords.lat;
    this.form.longitude = coords.lng;
  }

  get hasLocation(): boolean {
    return this.form.latitude !== 0 && this.form.longitude !== 0;
  }
 
  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage = true;
      setTimeout(() => (this.errorMessage = false), 4000);
      return;
    }
 
    const payload = this.buildPayload();

    if (this.isEditMode && this.eventToEdit) {
      this.eventService.updateEvent(this.eventToEdit.id, payload, this.newFiles.map(f => f.file)).subscribe({
        next: () => {
          this.successMessage = true;
          setTimeout(() => {
            this.successMessage = false;
            this.formResult.emit({ success: true, mode: 'edit' });
          }, 2000);
        },
        error: (err) => {
          console.error('Error al actualizar evento', err);
        },
      });
    } else {
      this.eventService.createEvent(payload, this.newFiles.map(f => f.file)).subscribe({
        next: () => {
          this.successMessage = true;
          setTimeout(() => {
            this.successMessage = false;
            this.formResult.emit({ success: true, mode: 'create' });
          }, 2000);
        },
        error: (err) => {
          console.error('Error al crear evento', err);
        },
      });
    }
  }
 
  onCancel(): void {
    this.formResult.emit({ success: false, mode: 'create' });
  }
}
