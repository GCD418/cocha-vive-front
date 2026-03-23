import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryDTO, EventModel } from '../../../models/event-model';
import { EventService } from '../../../services/event-service/event.service';

export interface EventFormResult {
  success: boolean;
  mode: 'create';
}

@Component({
  selector: 'app-event-form-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-form-component.html',
  styleUrl: './event-form-component.css',
})
export class EventFormComponent implements OnInit {
 
  @Output() formResult = new EventEmitter<EventFormResult>();
 
  categories: CategoryDTO[] = [];
  successMessage = false;
  errorMessage = false;
  selectedFiles: File[] = [];
 
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
  };
 
  constructor(private eventService: EventService) {}
 
  ngOnInit(): void {
    this.eventService.getCategories().subscribe(data => {
      this.categories = data;
    });
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
    };

    this.selectedFiles = [];
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
    };
    this.selectedFiles = [];
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
 
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
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
      latitude: 0.0,
      longitude: 0.0,
      shortPlaceDescription: this.form.shortPlaceDescription,
      peopleCapacity: this.form.peopleCapacity,
      dateStart: `${this.form.startDate}T${this.form.startTime}:00`,
      dateEnd: `${this.form.endDate}T${this.form.endTime}:00`,
      tags: this.form.tags,
    };
  }
 
  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage = true;
      setTimeout(() => (this.errorMessage = false), 4000);
      return;
    }
 
    const payload = this.buildPayload();
 
    this.eventService.createEvent(payload, this.selectedFiles).subscribe({
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
 
  onCancel(): void {
    this.formResult.emit({ success: false, mode: 'create' });
  }
}
