import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  mobileMenuOpen = false;
  isScrolled = false;

  ngOnInit() {
    document.body.classList.add('scrolled');
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
