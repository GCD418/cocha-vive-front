import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminRoleService } from '../../../services/admin-role/admin-role.service';
import { AuthService } from '../../../services/auth/auth.service';
import { UserModel } from '../../../models/user.model';

@Component({
  selector: 'app-admin-user-list',
  imports: [CommonModule, DatePipe, FormsModule, TranslateModule],
  templateUrl: './admin-user-list.html',
  styleUrl: './admin-user-list.css',
})
export class AdminUserListComponent implements OnInit {
  users: UserModel[] = [];
  filteredUsers: UserModel[] = [];
  pagedUsers: UserModel[] = [];

  loading = true;
  searchText = '';
  filterRole = '';
  filterDateFrom = '';
  filterDateTo = '';

  currentPage = 1;
  pageSize = 15;
  totalPages = 1;
  totalPagesArray: number[] = [];

  toastMessage = '';
  toastType: 'success' | 'danger' = 'success';
  showToast = false;

  pendingAction: 'promote' | 'demote' | null = null;
  pendingUser: UserModel | null = null;
  showConfirmModal = false;

  currentUserEmail = '';

  constructor(
    private adminRoleService: AdminRoleService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserEmail = this.authService.getRoleFromToken() ?? '';
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading = true;
    this.adminRoleService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.users];

    if (this.searchText.trim()) {
      const term = this.searchText.toLowerCase();
      result = result.filter(
        (u) =>
          this.getFullName(u).toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      );
    }

    if (this.filterRole) {
      result = result.filter((u) => u.role === this.filterRole);
    }

    if (this.filterDateFrom) {
      const from = new Date(this.filterDateFrom);
      result = result.filter((u) => new Date(u.createdAt) >= from);
    }

    if (this.filterDateTo) {
      const to = new Date(this.filterDateTo);
      result = result.filter((u) => new Date(u.createdAt) <= to);
    }

    this.filteredUsers = result;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.max(
      1,
      Math.ceil(this.filteredUsers.length / this.pageSize)
    );
    this.totalPagesArray = Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );
    this.updatePagedUsers();
  }

  updatePagedUsers(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedUsers = this.filteredUsers.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagedUsers();
  }

  getFullName(user: UserModel): string {
    return [user.names, user.firstLastName, user.secondLastName]
      .filter(Boolean)
      .join(' ');
  }

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      ROLE_SUPERADMIN: 'bg-dark',
      ROLE_ADMIN: 'bg-primary',
      ROLE_PUBLISHER: 'bg-info text-dark',
      ROLE_USER: 'bg-secondary',
    };
    return classes[role] ?? 'bg-secondary';
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      ROLE_SUPERADMIN: 'Superadmin',
      ROLE_ADMIN: 'Admin',
      ROLE_PUBLISHER: 'Publisher',
      ROLE_USER: 'User',
    };
    return labels[role] ?? role;
  }

  canPromote(user: UserModel): boolean {
    return user.role === 'ROLE_USER';
  }

  canDemote(user: UserModel): boolean {
    return user.role === 'ROLE_ADMIN';
  }

  openConfirmModal(user: UserModel, action: 'promote' | 'demote'): void {
    this.pendingUser = user;
    this.pendingAction = action;
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.pendingUser = null;
    this.pendingAction = null;
    this.showConfirmModal = false;
  }

  confirmAction(): void {
    if (!this.pendingUser || !this.pendingAction) return;

    const userId = this.pendingUser.id;
    const action =
      this.pendingAction === 'promote'
        ? this.adminRoleService.promoteToAdmin(userId)
        : this.adminRoleService.demoteToUser(userId);

    action.subscribe({
      next: (response) => {
        const idx = this.users.findIndex((u) => u.id === userId);
        if (idx !== -1) {
          this.users[idx] = { ...this.users[idx], role: response.role };
        }
        this.applyFilters();
        this.showNotification(
          this.pendingAction === 'promote'
            ? 'ADMIN_USERS.TOAST.PROMOTE_SUCCESS'
            : 'ADMIN_USERS.TOAST.DEMOTE_SUCCESS',
          'success'
        );
        this.closeConfirmModal();
      },
      error: () => {
        this.showNotification('ADMIN_USERS.TOAST.ERROR', 'danger');
        this.closeConfirmModal();
      },
    });
  }

  private showNotification(message: string, type: 'success' | 'danger'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 4500);
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchText ||
      this.filterRole ||
      this.filterDateFrom ||
      this.filterDateTo
    );
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterRole = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.onFilterChange();
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

}
