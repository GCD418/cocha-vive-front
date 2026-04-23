import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { RoleManagedUser } from '../../../models/role-management.model';
import { RoleManagementService } from '../../../services/role-management/role-management.service';
import { ConfirmModalComponent } from '../../../shared/confirmModal-Component/confirmModal-component';

type RoleActionType = 'promote' | 'demote';
type ToastType = 'success' | 'danger';

@Component({
  selector: 'app-superadmin-role-management',
  standalone: true,
  imports: [CommonModule, TranslateModule, ConfirmModalComponent],
  templateUrl: './superadmin-role-management.html',
  styleUrl: './superadmin-role-management.css',
})
export class SuperadminRoleManagementComponent implements OnInit {
  admins: RoleManagedUser[] = [];
  eligibleUsers: RoleManagedUser[] = [];

  loading = true;
  actionLoading = false;
  actionTargetUserId: number | null = null;
  actionTypeInProgress: RoleActionType | null = null;

  showToast = false;
  toastType: ToastType = 'success';
  toastMessageKey = '';

  errorMessageKey = '';

  showConfirmModal = false;
  confirmActionType: RoleActionType | null = null;
  confirmTarget: RoleManagedUser | null = null;

  activeSuperadminId: number | null = null;

  constructor(
    private roleManagementService: RoleManagementService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (currentUser) => {
        this.activeSuperadminId = currentUser?.id ?? null;
      },
    });

    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessageKey = '';

    forkJoin({
      admins: this.roleManagementService.getCurrentAdmins(),
      eligibleUsers: this.roleManagementService.getEligibleUsers(),
    }).subscribe({
      next: ({ admins, eligibleUsers }) => {
        this.admins = admins;
        this.eligibleUsers = eligibleUsers;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessageKey = 'SUPERADMIN_ROLE_MANAGEMENT.ERRORS.LOAD';
      },
    });
  }

  openPromotionConfirmation(user: RoleManagedUser): void {
    this.confirmActionType = 'promote';
    this.confirmTarget = user;
    this.showConfirmModal = true;
  }

  openDemotionConfirmation(user: RoleManagedUser): void {
    if (this.isSelf(user)) {
      return;
    }

    this.confirmActionType = 'demote';
    this.confirmTarget = user;
    this.showConfirmModal = true;
  }

  closeConfirmation(): void {
    if (this.actionLoading) {
      return;
    }

    this.showConfirmModal = false;
    this.confirmTarget = null;
    this.confirmActionType = null;
  }

  confirmRoleChange(): void {
    if (!this.confirmTarget || !this.confirmActionType) {
      return;
    }

    if (this.confirmActionType === 'demote' && this.isSelf(this.confirmTarget)) {
      this.closeConfirmation();
      return;
    }

    this.actionLoading = true;
    this.actionTargetUserId = this.confirmTarget.id;
    this.actionTypeInProgress = this.confirmActionType;

    const request$ =
      this.confirmActionType === 'promote'
        ? this.roleManagementService.promoteToAdmin(this.confirmTarget.id)
        : this.roleManagementService.demoteToUser(this.confirmTarget.id);

    request$.subscribe({
      next: () => {
        this.clearActionState();
        this.closeConfirmation();
        this.loadData();
        this.showNotification(
          this.confirmActionType === 'promote'
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
    this.actionLoading = false;
    this.actionTargetUserId = null;
    this.actionTypeInProgress = null;
  }

  private showNotification(messageKey: string, type: ToastType): void {
    this.toastMessageKey = messageKey;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }

  getFullName(user: RoleManagedUser): string {
    return [user.names, user.firstLastName, user.secondLastName]
      .filter(Boolean)
      .join(' ');
  }

  isSelf(user: RoleManagedUser): boolean {
    return this.activeSuperadminId !== null && user.id === this.activeSuperadminId;
  }

  isActionRunningFor(userId: number, action: RoleActionType): boolean {
    return this.actionLoading && this.actionTargetUserId === userId && this.actionTypeInProgress === action;
  }

  getConfirmTitleKey(): string {
    if (this.confirmActionType === 'promote') {
      return 'SUPERADMIN_ROLE_MANAGEMENT.MODAL.PROMOTE_TITLE';
    }

    return 'SUPERADMIN_ROLE_MANAGEMENT.MODAL.DEMOTE_TITLE';
  }

  getConfirmMessageKey(): string {
    if (this.confirmActionType === 'promote') {
      return 'SUPERADMIN_ROLE_MANAGEMENT.MODAL.PROMOTE_MESSAGE';
    }

    return 'SUPERADMIN_ROLE_MANAGEMENT.MODAL.DEMOTE_MESSAGE';
  }

  getConfirmButtonKey(): string {
    if (this.confirmActionType === 'promote') {
      return 'SUPERADMIN_ROLE_MANAGEMENT.MODAL.PROMOTE_BUTTON';
    }

    return 'SUPERADMIN_ROLE_MANAGEMENT.MODAL.DEMOTE_BUTTON';
  }
}
