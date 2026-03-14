import { Component } from '@angular/core';
import { HeroComponent } from '../../layout/hero/hero';
import { Categories } from '../../categories/categories';
import { FeaturedEventComponent } from '../../featured-event/featured-event';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, Categories, FeaturedEventComponent, ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {

}