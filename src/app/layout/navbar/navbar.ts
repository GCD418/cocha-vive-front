import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, CurrentUser } from '../../services/auth/auth.service';
import { LoginModalComponent } from '../../components/auth/login-modal/login-modal';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FeatureToggleService } from '../../services/feature-toggle/feature-toggle.service';
import { AppFeatures } from '../../models/app-features';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, LoginModalComponent, TranslateModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  mobileMenuOpen = false;
  userDropdownOpen = false; 
  langDropdownOpen = false;
  showLoginModal = false; 
  currentUser: CurrentUser | null = null;

  protected authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private featureToggleService = inject(FeatureToggleService);

  get currentLangLabel(): string {
    return (this.translate.getCurrentLang()|| 'es').toUpperCase();
  }

  get canSeePublisherRequestLink(): boolean {
    const isFeatureEnabled = this.featureToggleService.isEnabled(AppFeatures.MANAGE_PUBLISHER_REQUESTS);
    return isFeatureEnabled && this.userHasRole('ROLE_USER');
  }

  ngOnInit() {
    document.body.classList.add('scrolled');
    this.checkUserSession();
    this.route.queryParamMap.subscribe((params) => {
      if (params.get('login') === '1' && !this.showLoginModal) {
        this.openLoginModal();
        this.router.navigate([], {
          queryParams: { login: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  }

  toggleLangDropdown(event: Event): void {
    event.stopPropagation();
    this.langDropdownOpen = !this.langDropdownOpen;
    this.userDropdownOpen = false;
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    this.langDropdownOpen = false;
  }

  checkUserSession() {
    if (this.authService.isLoggedIn()) {
      this.authService.getCurrentUser().subscribe({
        next: (user) => { this.currentUser = user; },
        error: () => { this.currentUser = null; }
      });
    } else {
      this.currentUser = null;
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get canSeePublisherRequestsAdminLink(): boolean {
    const isFeatureEnabled = this.featureToggleService.isEnabled(AppFeatures.MANAGE_PUBLISHER_REQUESTS);
    return isFeatureEnabled && this.userHasRole('ROLE_ADMIN');
  }

  get canSeeSuperadminRoleManagementLink(): boolean {
    return this.userHasRole('ROLE_SUPERADMIN');
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
    this.langDropdownOpen = false; 
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.userDropdownOpen = false;
    this.langDropdownOpen = false; 
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

  private userHasRole(role: string): boolean {
    const payload = this.authService.getDecodedPayload(this.authService.getToken());
    const roles = this.normalizeRoles(payload?.roles);
    return roles.includes(role);
  }

  private normalizeRoles(rawRoles: unknown): string[] {
    if (!Array.isArray(rawRoles)) {
      return [];
    }

    return rawRoles
      .map((rawRole) => {
        if (typeof rawRole === 'string') {
          return rawRole;
        }

        if (
          rawRole !== null &&
          typeof rawRole === 'object' &&
          'authority' in rawRole &&
          typeof (rawRole as { authority?: unknown }).authority === 'string'
        ) {
          return (rawRole as { authority: string }).authority;
        }

        return null;
      })
      .filter((roleName): roleName is string => Boolean(roleName));
  }
  
  get roleLabel(): string {
    const labels: Record<string, string> = {
      ROLE_USER: 'NAV.ROLES.USER',
      ROLE_PUBLISHER: 'NAV.ROLES.PUBLISHER',
      ROLE_ADMIN: 'NAV.ROLES.ADMIN',
      ROLE_SUPERADMIN: 'NAV.ROLES.SUPERADMIN'
    };
    return labels[this.authService.getRoleFromToken() ?? ''] ?? '';
  }
}