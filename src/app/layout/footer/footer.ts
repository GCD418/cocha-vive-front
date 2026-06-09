import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  protected readonly contactEmail = 'gforce4182@gmail.com';
  protected readonly appVersion = '1.0.0';
  protected readonly currentYear = new Date().getFullYear();
  protected readonly copied = signal(false);

  copyEmail(): void {
    navigator.clipboard.writeText(this.contactEmail)
      .then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      })
      .catch(() => {
        window.location.href = `mailto:${this.contactEmail}`;
      });
    }
}