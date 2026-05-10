import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth/auth.service';
import { RoleManagedUser } from '../../../models/role-management.model';
import { RoleManagementService } from '../../../services/role-management/role-management.service';
import { ConfirmModalComponent } from '../../../shared/confirmModal-Component/confirmModal-component';
import { PublisherDemotionModal } from '../../../shared/publisher-demotion-modal/publisher-demotion-modal';

type RoleActionType = 'promote' | 'demote';
type ToastType = 'success' | 'danger';

@Component({
  selector: 'app-superadmin-role-management',
  imports: [CommonModule, TranslateModule, ConfirmModalComponent, PublisherDemotionModal],
  templateUrl: './superadmin-role-management.html',
  styleUrl: './superadmin-role-management.css',
})
export class SuperadminRoleManagementComponent implements OnInit {
  admins = signal<RoleManagedUser[]>([]);
  eligibleUsers = signal<RoleManagedUser[]>([]);

  publishers = signal<RoleManagedUser[]>([]);
  isAdminView = signal(false);

  showDemotionModal = signal(false);
  demotionTarget = signal<RoleManagedUser | null>(null);
  demotionLoading = signal(false);

  loading = signal(true);
  actionLoading = signal(false);
  actionTargetUserId = signal<number | null>(null);
  actionTypeInProgress = signal<RoleActionType | null>(null);

  showToast = signal(false);
  toastType = signal<ToastType>('success');
  toastMessageKey = signal('');

  errorMessageKey = signal('');

  showConfirmModal = signal(false);
  confirmActionType = signal<RoleActionType | null>(null);
  confirmTarget = signal<RoleManagedUser | null>(null);

  activeSuperadminId = signal<number | null>(null);

  constructor(
    private roleManagementService: RoleManagementService,
    private authService: AuthService
  ) {}

  private blockRoleManagement(): void {
    this.activeSuperadminId.set(null);
    this.admins.set([]);
    this.eligibleUsers.set([]);
    this.loading.set(false);
    this.errorMessageKey.set('SUPERADMIN_ROLE_MANAGEMENT.ERRORS.LOAD');
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.errorMessageKey.set('');

    this.authService.getCurrentUser().subscribe({
      next: (currentUser) => {
        if (currentUser?.id == null) {
          this.blockRoleManagement();
          return;
        }

        this.activeSuperadminId.set(currentUser.id);
        this.isAdminView.set(currentUser.role === 'ROLE_ADMIN');
        this.loadData();
      },
      error: () => {
        this.blockRoleManagement();
      },
    });
  }

  loadData(): void {
    this.loading.set(true);
    this.errorMessageKey.set('');

    this.roleManagementService.getRoleManagementLists().subscribe({
      next: ({ admins, eligibleUsers, publishers }) => {
      if (this.isAdminView()) {
        this.publishers.set(publishers);
      } else {
        this.admins.set(admins);
        this.eligibleUsers.set(eligibleUsers);
      }
      this.loading.set(false);  
      },
    });
  }

  openPromotionConfirmation(user: RoleManagedUser): void {
    this.confirmActionType.set('promote');
    this.confirmTarget.set(user);
    this.showConfirmModal.set(true);
  }

  openDemotionConfirmation(user: RoleManagedUser): void {
    if (this.isSelf(user)) {
      return;
    }

    this.confirmActionType.set('demote');
    this.confirmTarget.set(user);
    this.showConfirmModal.set(true);
  }

  closeConfirmation(): void {
    if (this.actionLoading()) {
      return;
    }

    this.showConfirmModal.set(false);
    this.confirmTarget.set(null);
    this.confirmActionType.set(null);
  }

  confirmRoleChange(): void {
    const confirmTarget = this.confirmTarget();
    const confirmActionType = this.confirmActionType();

    if (!confirmTarget || !confirmActionType) {
      return;
    }

    if (confirmActionType === 'demote' && this.isSelf(confirmTarget)) {
      this.closeConfirmation();
      return;
    }

    this.actionLoading.set(true);
    this.actionTargetUserId.set(confirmTarget.id);
    this.actionTypeInProgress.set(confirmActionType);

    const request$ =
      confirmActionType === 'promote'
        ? this.roleManagementService.promoteToAdmin(confirmTarget.id)
        : this.roleManagementService.demoteToUser(confirmTarget.id);

    request$.subscribe({
      next: () => {
        this.clearActionState();
        this.closeConfirmation();
        this.loadData();
        this.showNotification(
          confirmActionType === 'promote'
            ? 'SUPERADMIN_ROLE_MANAGEMENT.TOAST.PROMOTE_SUCCESS'
            : 'SUPERADMIN_ROLE_MANAGEMENT.TOAST.DEMOTE_SUCCESS',
          'success'
        );
      },
      error: () => {
        this.clearActionState();
        this.closeConfirmation();
        this.showNotification('SUPERADMIN_ROLE_MANAGEMENT.TOAST.ACTION_ERROR', 'danger');
      },
    });
  }

  private clearActionState(): void {
    this.actionLoading.set(false);
    this.actionTargetUserId.set(null);
    this.actionTypeInProgress.set(null);
  }

  private showNotification(messageKey: string, type: ToastType): void {
    this.toastMessageKey.set(messageKey);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => {
      this.showToast.set(false);
    }, 4000);
  }

  getFullName(user: RoleManagedUser): string {
    return [user.names, user.firstLastName, user.secondLastName]
      .filter(Boolean)
      .join(' ');
  }

  isSelf(user: RoleManagedUser): boolean {
    return this.activeSuperadminId() !== null && user.id === this.activeSuperadminId();
  }

  isActionRunningFor(userId: number, action: RoleActionType): boolean {
    return this.actionLoading() && this.actionTargetUserId() === userId && this.actionTypeInProgress() === action;
  }

  getConfirmTitleKey(): string {
    if (this.confirmActionType() === 'promote') {
      return 'SUPERADMIN_ROLE_MANAGEMENT.MODAL.PROMOTE_TITLE';
    }

    return 'SUPERADMIN_ROLE_MANAGEMENT.MODAL.DEMOTE_TITLE';
  }

  getConfirmMessageKey(): string {
    if (this.confirmActionType() === 'promote') {
      return 'SUPERADMIN_ROLE_MANAGEMENT.MODAL.PROMOTE_MESSAGE';
    }

    return 'SUPERADMIN_ROLE_MANAGEMENT.MODAL.DEMOTE_MESSAGE';
  }

  getConfirmButtonKey(): string {
    if (this.confirmActionType() === 'promote') {
      return 'SUPERADMIN_ROLE_MANAGEMENT.MODAL.PROMOTE_BUTTON';
    }

    return 'SUPERADMIN_ROLE_MANAGEMENT.MODAL.DEMOTE_BUTTON';
  }

  openPublisherDemotionModal(user: RoleManagedUser): void {
    this.demotionTarget.set(user);
    this.showDemotionModal.set(true);
  }

  closePublisherDemotionModal(): void {
    if (this.demotionLoading()) return;
    this.showDemotionModal.set(false);
    this.demotionTarget.set(null);
  }

  confirmPublisherDemotion(demotionReason: string): void {
    const target = this.demotionTarget();
    if (!target) return;

    this.demotionLoading.set(true);

    this.roleManagementService.demotePublisher(target.id, { demotionReason }).subscribe({
      next: () => {
        this.demotionLoading.set(false);
        this.closePublisherDemotionModal();
        this.loadData();
        this.showNotification(
          'SUPERADMIN_ROLE_MANAGEMENT.TOAST.PUBLISHER_DEMOTE_SUCCESS',
          'success'
        );
      },
      error: () => {
        this.demotionLoading.set(false);
        this.closePublisherDemotionModal();
        this.showNotification(
          'SUPERADMIN_ROLE_MANAGEMENT.TOAST.ACTION_ERROR',
          'danger'
        );
      },
    });
  }
}
