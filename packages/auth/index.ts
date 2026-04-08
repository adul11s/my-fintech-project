// packages/auth/index.ts
export const roles = {
  ADMIN: 'admin',
  USER: 'user',
};

export const hasPermission = (userRole: string, requiredRole: string) => {
  return userRole === requiredRole || userRole === roles.ADMIN;
};