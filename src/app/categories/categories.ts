import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories implements OnInit {

  categories: Category[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error("Error loading categories", err);
      }
    });
  }

}