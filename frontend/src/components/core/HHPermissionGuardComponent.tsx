import React, { type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';

interface HHPermissionGuardProps {
  permission: string | string[];
  mode?: 'any' | 'every';
  children: ReactNode;
  fallback?: ReactNode;
}

export const HHPermissionGuard: React.FC<HHPermissionGuardProps> = ({
  permission,
  mode = 'any',
  children,
  fallback = null,
}) => {
  const { hasPermission, hasAllPermissions } = useAuth();

  const isAllowed = Array.isArray(permission)
    ? mode === 'every'
      ? hasAllPermissions(permission)
      : hasPermission(permission)
    : hasPermission(permission);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
