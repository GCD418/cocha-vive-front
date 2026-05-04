import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  protected readonly contactEmail = 'gforce4182@gmail.com';
  protected readonly comment = signal('');

  protected readonly hasComment = computed(() => this.comment().trim().length > 0);

  sendEmail(): void {
    const message = this.comment().trim();

    if (!message) {
      return;
    }

    const subject = encodeURIComponent('Consulta desde Cocha Vive');
    const body = encodeURIComponent(
      `Hola,\n\nEscribo porque tengo el siguiente comentario o duda:\n\n${message}\n\nGracias.`
    );

    window.location.href = `mailto:${this.contactEmail}?subject=${subject}&body=${body}`;
  }
}