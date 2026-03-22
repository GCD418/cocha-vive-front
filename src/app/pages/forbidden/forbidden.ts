import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden-page',
  imports: [RouterLink],
  templateUrl: './forbidden.html',
  styleUrl: './forbidden.css',
})
export class ForbiddenPageComponent {
  private route = inject(ActivatedRoute);

  attemptedUrl = this.route.snapshot.queryParamMap.get('from');
}
