import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../services/category-services/category.service';
import { Category } from '../../../models/category.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-categories-card',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './categories-card.html',
  styleUrl: './categories-card.css'
})
export class CategoriesCard implements OnInit {

  categories = signal<Category[]>([]);
  loading = signal(true);
  errorLoading = signal(false);

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        console.log('✅ Categorías recibidas:', data);
        this.categories.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("❌ Error al cargar categorías:", err);
        this.loading.set(false);
        this.errorLoading.set(true);
      }
    });
  }

}
