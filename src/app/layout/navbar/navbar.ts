import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, CurrentUser } from '../../services/auth/auth.service';
import { LoginModalComponent } from '../../components/auth/login-modal/login-modal';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, LoginModalComponent ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  mobileMenuOpen = false;
  isScrolled = false;

  showLoginModal = false;
  currentUser: CurrentUser | null = null;
  
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    document.body.classList.add('scrolled');
    this.checkUserSession();
  }

  checkUserSession() {
    if (this.authService.isLoggedIn()) {
      this.authService.getCurrentUser().subscribe(user => {
        this.currentUser = user;
      });
    } else {
      this.currentUser = null;
    }
  }

  openLoginModal() {
    this.showLoginModal = true;
    this.closeMobileMenu();
  }

  closeLoginModal() {
    this.showLoginModal = false;
    this.checkUserSession();
  }

  logout() {
    this.authService.logout();
    this.currentUser = null;
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