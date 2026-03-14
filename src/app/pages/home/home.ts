import { Component } from '@angular/core';
import { HeroComponent } from '../../layout/hero/hero';
import { Categories } from '../../categories/categories';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, Categories, UpcomingEventComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {

}