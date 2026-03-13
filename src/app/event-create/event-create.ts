import { EventService } from '../event-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { CategoryDTO } from '../event-model';

@Component({
  selector: 'app-event-create',
  imports: [CommonModule, FormsModule],
  templateUrl: './event-create.html',
  styleUrl: './event-create.css',
})
export class EventCreate implements OnInit {

  categories: CategoryDTO[] = []; 
  successMessage = false;

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

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit(): void {
    this.eventService.getCategories().subscribe(data => {
    this.categories = data;
    });
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

  onSubmit(): void {
    const payload = {
      title: this.form.title,
      shortDescription: this.form.shortDescription,
      description: this.form.description,
      cost: this.form.costType === 'gratuito' ? 0 : this.form.cost,
      categoryId: this.form.categoryId,
      organizedByUserId: 1,
      latitude: 0.0,
      longitude: 0.0,
      shortPlaceDescription: '',
      peopleCapacity: this.form.peopleCapacity,
      dateStart: `${this.form.startDate}T${this.form.startTime}:00`,
      dateEnd: `${this.form.endDate}T${this.form.endTime}:00`,
      tags: this.form.tags,
      photoLinks: [],
    };

    this.eventService.createEvent(payload).subscribe({
      next: () => {
        this.successMessage = true;
        setTimeout(() => {
          this.router.navigate(['/events']);
        }, 4000);
      },
      error: (err) => {
        console.error('Error al crear evento', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

}
