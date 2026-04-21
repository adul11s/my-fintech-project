export const apiFetch = (path: string, options: RequestInit = {}) => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('fintech_jwt_token='))
    ?.split('=')[1];

  console.log('Token found:', token ? 'yes' : 'no'); // debug

  return fetch(`http://localhost:3004${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
};