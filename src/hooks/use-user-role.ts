import { useAuthStore } from '@/lib/store';

export type UserRole = 'superadmin' | 'admin' | 'contributor' | 'viewer';

export function useUserRole() {
  const { user } = useAuthStore();
  
  const roleName = user?.role_name?.toLowerCase() || user?.role?.name?.toLowerCase() || 'viewer';

  const isSuperAdmin = roleName === 'superadmin';
  const isAdmin = roleName === 'admin' || isSuperAdmin;
  const isContributor = roleName === 'contributor' || isAdmin;
  const isViewer = true; // Everyone is a viewer

  const currentRole: UserRole = isSuperAdmin 
    ? 'superadmin' 
    : roleName === 'admin' 
      ? 'admin' 
      : roleName === 'contributor' 
        ? 'contributor' 
        : 'viewer';

  return {
    role: currentRole,
    isSuperAdmin,
    isAdmin,
    isContributor,
    isViewer,
    tenantId: user?.tenant_id
  };
}
