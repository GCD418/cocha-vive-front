import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-forbidden-page',
  imports: [RouterLink, TranslateModule],
  templateUrl: './forbidden.html',
  styleUrl: './forbidden.css',
})
export class ForbiddenPageComponent {
  private route = inject(ActivatedRoute);

  attemptedUrl = this.route.snapshot.queryParamMap.get('from');
}
