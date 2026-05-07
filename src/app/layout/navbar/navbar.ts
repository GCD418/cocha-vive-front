import { CommonModule } from '@angular/common';
import { Component, computed, effect, HostListener, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, CurrentUser } from '../../services/auth/auth.service';
import { LoginModalComponent } from '../../components/auth/login-modal/login-modal';
import { EmailRegistrationModal } from '../../components/auth/email-registration-modal/email-registration-modal';
import { FacebookAuthService } from '../../services/auth/facebook-auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FeatureToggleService } from '../../services/feature-toggle/feature-toggle.service';
import { AppFeatures } from '../../models/app-features';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { NotificationService } from '../../services/notification-service/notification.service';
import { NotificationItem } from '../../models/notification.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, LoginModalComponent, EmailRegistrationModal, TranslateModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  mobileMenuOpen = signal(false);
  userDropdownOpen = signal(false); 
  langDropdownOpen = signal(false);
  notificationsPanelOpen = signal(false);
  showLoginModal = signal(false); 
  currentUser = signal<CurrentUser | null>(null);

  showEmailModal = signal(false);
  fbRegistrationToken = signal<string | null>(null);
  fbName = signal('');
  fbPhotoUrl = signal('');
  isEmailLoading = signal(false);
  fbServerError = signal('');

  showSuccessToast = signal(false);
  toastMessage = signal('');
  notifications = signal<NotificationItem[]>([]);
  notificationsLoading = signal(false);
  notificationsError = signal(false);
  unreadCount = signal(0);

  protected authService = inject(AuthService);
  private facebookAuthService = inject(FacebookAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private featureToggleService = inject(FeatureToggleService);
  private notificationService = inject(NotificationService);

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
    return isFeatureEnabled && (this.userHasRole('ROLE_ADMIN'));
  });

  canSeeAdminEventsLink = computed(() => {
    return this.userHasRole('ROLE_ADMIN');
  });

  canSeeRoleManagementLink = computed(() => {
    return this.userHasRole('ROLE_SUPERADMIN') || this.userHasRole('ROLE_ADMIN');
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
    const currentUserRole = this.currentUser()?.role;
    return labels[currentUserRole ?? this.authService.getRoleFromToken() ?? ''] ?? '';
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

  hasUnreadNotifications = computed(() => this.unreadCount() > 0);

  get currentLangLabel(): string {
    return (this.translate.getCurrentLang()|| 'es').toUpperCase();
  }

  ngOnInit() {
    document.body.classList.add('scrolled');
    this.checkUserSession();
  }

  onPendingEmailRegistration(data: {
    registrationToken: string;
    facebookName: string;
    facebookPhotoUrl: string;
  }): void {
    this.showLoginModal.set(false);
 
    this.fbRegistrationToken.set(data.registrationToken);
    this.fbName.set(data.facebookName);
    this.fbPhotoUrl.set(data.facebookPhotoUrl);
    this.fbServerError.set('');
 
    this.router.navigate(['/home']).then(() => {
      this.showEmailModal.set(true);
    });
  }

  onEmailSubmit(email: string): void {
    const token = this.fbRegistrationToken();
    if (!token) return;
 
    this.isEmailLoading.set(true);
 
    this.facebookAuthService.registerEmail(token, email).subscribe({
      next: () => {
        this.isEmailLoading.set(false);
        this.showEmailModal.set(false);
        this.fbRegistrationToken.set(null);
        this.fbServerError.set('');  
        this.toastMessage.set(this.translate.instant('AUTH.EMAIL_SENT_TOAST'));
        this.showSuccessToast.set(true);
        setTimeout(() => this.showSuccessToast.set(false), 4000);
      },
      error: (err) => {
        console.error('Email registration error', err);
        this.isEmailLoading.set(false);
        if (err.status === 400) {
          this.fbServerError.set(
            this.translate.instant('AUTH.EMAIL_ERROR_ALREADY_REGISTERED')
          );
        }
      }
    });
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
        next: (user) => {
          this.currentUser.set(user);
          if (user) {
            this.loadUnreadCount();
          } else {
            this.resetNotificationsState();
          }
        },
        error: () => {
          this.currentUser.set(null);
          this.resetNotificationsState();
        }
      });
    } else {
      this.currentUser.set(null);
      this.resetNotificationsState();
    }
  }

  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.userDropdownOpen.update((open) => !open);
    this.langDropdownOpen.set(false); 
    this.notificationsPanelOpen.set(false);
  }

  toggleNotificationsPanel(event: Event): void {
    event.stopPropagation();

    const willOpen = !this.notificationsPanelOpen();
    this.notificationsPanelOpen.set(willOpen);
    this.userDropdownOpen.set(false);
    this.langDropdownOpen.set(false);

    if (willOpen) {
      this.loadNotifications();
    }
  }

  onNotificationOpen(notification: NotificationItem): void {
    if (!notification.unread) {
      return;
    }

    const previousNotifications = this.notifications();
    const previousUnreadCount = this.unreadCount();

    this.notifications.update((current) =>
      current.map((item) =>
        item.id === notification.id
          ? { ...item, unread: false }
          : item
      )
    );
    this.unreadCount.set(Math.max(0, previousUnreadCount - 1));

    this.notificationService.markAsRead(notification.id).subscribe({
      error: () => {
        this.notifications.set(previousNotifications);
        this.unreadCount.set(previousUnreadCount);
        this.notificationsError.set(true);
      },
    });
  }

  markAllNotificationsAsRead(): void {
    if (!this.notifications().some((notification) => notification.unread)) {
      return;
    }

    const previousNotifications = this.notifications();
    const previousUnreadCount = this.unreadCount();

    this.notifications.update((current) =>
      current.map((notification) => ({ ...notification, unread: false }))
    );
    this.unreadCount.set(0);

    this.notificationService.markAllAsRead().subscribe({
      error: () => {
        this.notifications.set(previousNotifications);
        this.unreadCount.set(previousUnreadCount);
        this.notificationsError.set(true);
      },
    });
  }

  retryNotificationsLoad(event?: Event): void {
    event?.stopPropagation();
    this.loadNotifications();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.userDropdownOpen.set(false);
    this.langDropdownOpen.set(false); 
    this.notificationsPanelOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.userDropdownOpen.set(false);
    this.langDropdownOpen.set(false);
    this.notificationsPanelOpen.set(false);
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
    this.resetNotificationsState();
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
    const currentUserRole = this.currentUser()?.role;
    if (currentUserRole === role) {
      return true;
    }

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

  private loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => {
        this.unreadCount.set(Math.max(0, Number(count) || 0));
      },
      error: () => {
        this.unreadCount.set(0);
      },
    });
  }

  private loadNotifications(): void {
    this.notificationsLoading.set(true);
    this.notificationsError.set(false);

    this.notificationService.getMyNotifications().subscribe({
      next: (notifications) => {
        const sorted = [...notifications].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        this.notifications.set(sorted);
        this.notificationsLoading.set(false);
        this.notificationsError.set(false);
        this.unreadCount.set(sorted.filter((notification) => notification.unread).length);
      },
      error: () => {
        this.notifications.set([]);
        this.notificationsLoading.set(false);
        this.notificationsError.set(true);
      },
    });
  }

  private resetNotificationsState(): void {
    this.notifications.set([]);
    this.notificationsLoading.set(false);
    this.notificationsError.set(false);
    this.notificationsPanelOpen.set(false);
    this.unreadCount.set(0);
  }
  
}
