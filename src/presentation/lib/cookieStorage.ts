function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const cookieStorage = {
  getItem: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${escapeRegExp(name)}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof document === 'undefined') return;
    const maxAge = 60 * 60 * 24 * 365;
    const secure = document.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax${secure}`;
  },
  removeItem: (name: string): void => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; max-age=0; path=/`;
  },
};
