import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { CategoriesCard } from './categories-card';
import { CategoryService } from '../../../services/category-services/category.service';
import { Category } from '../../../models/category.model';

describe('CategoriesCard', () => {
  let component: CategoriesCard;
  let fixture: ComponentFixture<CategoriesCard>;

  const categoriesMock: Category[] = [
    {
      id: 1,
      name: 'Música',
      description: 'Eventos musicales',
      identifyingIcon: 'music.svg',
    },
  ];

  const categoryServiceMock = {
    getCategories: () => of(categoriesMock),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesCard, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: CategoryService, useValue: categoryServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    expect(component.categories()).toEqual(categoriesMock);
    expect(component.loading()).toBeFalsy();
    expect(component.errorLoading()).toBeFalsy();
  });
});
