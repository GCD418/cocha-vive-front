import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, CurrentUser } from '../../services/auth/auth.service';


@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  mobileMenuOpen = false;
  currentUser: CurrentUser | null = null;
  userDropdownOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    document.body.classList.add('scrolled');
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.getCurrentUser().subscribe({
        next: (user) => { this.currentUser = user; },
        error: () => { this.currentUser = null; }
      });
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get displayName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.names} ${this.currentUser.firstLastName}`;
  }

  get initials(): string {
    if (!this.currentUser) return '';
    const first = this.currentUser.names?.charAt(0) ?? '';
    const last = this.currentUser.firstLastName?.charAt(0) ?? '';
    return (first + last).toUpperCase();
  }

  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.userDropdownOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.currentUser = null;
    this.userDropdownOpen = false;
    this.router.navigate(['/home']);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    document.body.classList.add('scrolled');
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      document.body.classList.add('mobile-nav-active');
    } else {
        document.body.classList.remove('mobile-nav-active');
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    document.body.classList.remove('mobile-nav-active');
  } 

}
