import { EventService } from '../event-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-event-create',
  imports: [CommonModule, FormsModule],
  templateUrl: './event-create.html',
  styleUrl: './event-create.css',
})
export class EventCreate implements OnInit {


  successMessage = false;

  availableTags: string[] = [
    'música', 'danza', 'teatro', 'folklore', 'arte', 'cultura',
    'familia', 'gratuito', 'religioso', 'gastronómico', 'deportivo',
    'educativo', 'infantil', 'contemporáneo', 'tradicional'
  ];

  form = {
    title: '',
    shortDescription: '',
    description: '',
    cost: 0,
    costType: 'gratuito',
    categoryId: null as number | null,
    tags: [] as string[],
    photoLinks: [] as string[],
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  };

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit(): void {

  }

  toggleTag(tag: string): void {
    const index = this.form.tags.indexOf(tag);
    if (index === -1) {
      this.form.tags.push(tag);
    } else {
      this.form.tags.splice(index, 1);
    }
  }

  isTagSelected(tag: string): boolean {
    return this.form.tags.includes(tag);
  }

  onSubmit(): void {
    const payload = {
      title: this.form.title,
      shortDescription: this.form.shortDescription,
      description: this.form.description,
      cost: this.form.costType === 'gratuito' ? 0 : this.form.cost,
      categoryId: this.form.categoryId,
      tags: this.form.tags,
      photoLinks: this.form.photoLinks,
      startDate: this.form.startDate,
      startTime: this.form.startTime,
      endDate: this.form.endDate,
      endTime: this.form.endTime,
    };

    this.eventService.createEvent(payload).subscribe({
      next: () => {
        this.successMessage = true;
        setTimeout(() => {
          this.router.navigate(['/eventos']);
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
