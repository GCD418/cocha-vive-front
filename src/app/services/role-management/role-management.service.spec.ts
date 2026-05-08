import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RoleManagementService } from './role-management.service';
import { RoleManagedUser } from '../../models/role-management.model';
import { of } from 'rxjs';

const mockUsers: RoleManagedUser[] = [
  { id: 1, names: 'Ana', firstLastName: 'Lopez', email: 'ana@mail.com', role: 'ROLE_ADMIN' },
  { id: 2, names: 'Luis', firstLastName: 'Rios', email: 'luis@mail.com', role: 'ROLE_USER' },
  { id: 3, names: 'Laura', firstLastName: 'Gomez', email: 'laura@mail.com', role: 'ROLE_PUBLISHER' },
  { id: 4, names: 'Pedro', firstLastName: 'Vega', email: 'pedro@mail.com', role: 'ROLE_PUBLISHER' },
];

describe('RoleManagementService', () => {
  let service: RoleManagementService;
  let httpClientMock: any;

  beforeEach(() => {
    httpClientMock = {
      get: vi.fn().mockReturnValue(of(mockUsers)),
      patch: vi.fn().mockReturnValue(of(null)),
    };
    service = new RoleManagementService(httpClientMock);
  });

  describe('getCurrentPublishers', () => {
    it('should return only ROLE_PUBLISHER users', () => {
      service.getCurrentPublishers().subscribe((publishers) => {
        expect(publishers.length).toBe(2);
        expect(publishers.every((u) => u.role === 'ROLE_PUBLISHER')).toBe(true);
      });
    });

    it('should return empty array when no publishers exist', () => {
      const usersWithoutPublishers = mockUsers.filter(
        (u) => u.role !== 'ROLE_PUBLISHER'
      );
      httpClientMock.get.mockReturnValue(of(usersWithoutPublishers));

      service.getCurrentPublishers().subscribe((publishers) => {
        expect(publishers.length).toBe(0);
      });
    });
  });

  describe('demotePublisher', () => {
    it('should call PATCH /{userId}/demote-publisher with demotionReason', () => {
      const userId = 3;
      const payload = { demotionReason: 'Violated content guidelines repeatedly.' };

      service.demotePublisher(userId, payload).subscribe();

      expect(httpClientMock.patch).toHaveBeenCalledWith(
        expect.stringContaining(`/${userId}/demote-publisher`),
        payload
      );
    });

    it('should complete successfully on 200 response', () => {
      const completeSpy = vi.fn();

      service.demotePublisher(3, { demotionReason: 'Valid reason here.' }).subscribe({
        complete: completeSpy,
      });

      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('getRoleManagementLists', () => {
    it('should include publishers in the returned lists', () => {
      service.getRoleManagementLists().subscribe(({ admins, eligibleUsers, publishers }) => {
        expect(admins.length).toBe(1);
        expect(eligibleUsers.length).toBe(1);
        expect(publishers.length).toBe(2);
      });
    });
  });
});