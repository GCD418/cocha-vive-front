import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SuperadminRoleManagementComponent } from './superadmin-role-management';
import { RoleManagementService } from '../../../services/role-management/role-management.service';
import { AuthService } from '../../../services/auth/auth.service';

describe('SuperadminRoleManagementComponent', () => {
  let component: SuperadminRoleManagementComponent;
  let fixture: ComponentFixture<SuperadminRoleManagementComponent>;

  beforeEach(async () => {
    const roleManagementServiceMock = {
      getCurrentAdmins: () => of([]),
      getEligibleUsers: () => of([]),
      promoteToAdmin: () => of(void 0),
      demoteToUser: () => of(void 0),
    };

    const authServiceMock = {
      getCurrentUser: () => of(null),
    };

    await TestBed.configureTestingModule({
      imports: [SuperadminRoleManagementComponent],
      providers: [
        { provide: RoleManagementService, useValue: roleManagementServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SuperadminRoleManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
