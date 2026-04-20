import { CommonModule } from '@angular/common';
import { Component, computed, effect, HostListener, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, CurrentUser } from '../../services/auth/auth.service';
import { LoginModalComponent } from '../../components/auth/login-modal/login-modal';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FeatureToggleService } from '../../services/feature-toggle/feature-toggle.service';
import { AppFeatures } from '../../models/app-features';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, LoginModalComponent, TranslateModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  mobileMenuOpen = signal(false);
  userDropdownOpen = signal(false); 
  langDropdownOpen = signal(false);
  showLoginModal = signal(false); 
  currentUser = signal<CurrentUser | null>(null);

  protected authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private featureToggleService = inject(FeatureToggleService);

  private loginQueryParam = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('login'))),
    { initialValue: null }
  );

  isLoggedIn = computed(() => this.authService.isAuthenticated());

  canSeePublisherRequestLink = computed(() => {
    const isFeatureEnabled = this.featureToggleService.isEnabled(AppFeatures.MANAGE_PUBLISHER_REQUESTS);
    return isFeatureEnabled && this.userHasRole('ROLE_USER');
  });

  canSeePublisherRequestsAdminLink = computed(() => {
    const isFeatureEnabled = this.featureToggleService.isEnabled(AppFeatures.MANAGE_PUBLISHER_REQUESTS);
    return isFeatureEnabled && this.userHasRole('ROLE_ADMIN');
  });

  displayName = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.names} ${user.firstLastName}`;
  });

  initials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    const first = user.names?.charAt(0) ?? '';
    const last = user.firstLastName?.charAt(0) ?? '';
    return (first + last).toUpperCase();
  });

  roleLabel = computed(() => {
    const labels: Record<string, string> = {
      ROLE_USER: 'NAV.ROLES.USER',
      ROLE_PUBLISHER: 'NAV.ROLES.PUBLISHER',
      ROLE_ADMIN: 'NAV.ROLES.ADMIN',
      ROLE_SUPERADMIN: 'NAV.ROLES.SUPERADMIN'
    };
    return labels[this.authService.getRoleFromToken() ?? ''] ?? '';
  });

  constructor() {
    effect(() => {
      const login = this.loginQueryParam();
      if (login === '1' && !this.showLoginModal()) {
        this.openLoginModal();
        this.router.navigate([], {
          queryParams: { login: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  }

  get currentLangLabel(): string {
    return (this.translate.getCurrentLang()|| 'es').toUpperCase();
  }

  ngOnInit() {
    document.body.classList.add('scrolled');
    this.checkUserSession();
  }

  toggleLangDropdown(event: Event): void {
    event.stopPropagation();
    this.langDropdownOpen.update((open) => !open);
    this.userDropdownOpen.set(false);
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    this.langDropdownOpen.set(false);
  }

  checkUserSession() {
    if (this.authService.isLoggedIn()) {
      this.authService.getCurrentUser().subscribe({
        next: (user) => { this.currentUser.set(user); },
        error: () => { this.currentUser.set(null); }
      });
    } else {
      this.currentUser.set(null);
    }
  }

  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.userDropdownOpen.update((open) => !open);
    this.langDropdownOpen.set(false); 
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.userDropdownOpen.set(false);
    this.langDropdownOpen.set(false); 
  }

  openLoginModal() {
    this.showLoginModal.set(true);
    this.closeMobileMenu();
  }

  closeLoginModal() {
    this.showLoginModal.set(false);
    this.checkUserSession(); 
  }

  logout() {
    this.authService.logout();
    this.currentUser.set(null);
    this.userDropdownOpen.set(false);
    this.router.navigate(['/home']);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    document.body.classList.add('scrolled');
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update((open) => !open);
    if (this.mobileMenuOpen()) {
      document.body.classList.add('mobile-nav-active');
    } else {
      document.body.classList.remove('mobile-nav-active');
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
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
  
}
