// packages/auth/index.ts
export const roles = {
  ADMIN: 'admin',
  USER: 'user',
};

export const hasPermission = (userRole: string, requiredRole: string) => {
  return userRole === requiredRole || userRole === roles.ADMIN;
};

export const login = (token: string, role: string) => {
  document.cookie = `fintech_jwt_token=${token}; path=/`;
  document.cookie = `fintech_user_role=${role}; path=/`;
};

export const logout = () => {
  document.cookie = 'fintech_jwt_token=; path=/; max-age=0';
  document.cookie = 'fintech_user_role=; path=/; max-age=0';
};