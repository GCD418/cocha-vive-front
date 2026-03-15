import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../services/category-services/category.service';
import { Category } from '../../../models/category-model/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories implements OnInit {

  categories: Category[] = [];
  loading = true;
  errorLoading = false;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        console.log('✅ Categorías recibidas:', data);
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        console.error("❌ Error al cargar categorías:", err);
        this.loading = false;
        this.errorLoading = true;
      }
    });
  }

}