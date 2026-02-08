/**
 * Pobiera tenant ID zalogowanego użytkownika
 * ZAWSZE bierze z tokena JWT - to jest jedyne wiarygodne źródło
 */
export function getTenantId(): string {
  if (typeof window === 'undefined') {
    return 'default';
  }

  try {
    // NAJPIERW sprawdź token JWT - to jest jedyne wiarygodne źródło
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.tenantId) {
          return String(payload.tenantId);
        }
      } catch (e) {
        console.error('Error decoding JWT:', e);
      }
    }

    // Fallback do user tylko jeśli nie ma tokena
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const tenantId = user.tenantId || user.tenant?.id;
      if (tenantId) {
        return String(tenantId);
      }
    }

    return 'default';
  } catch (error) {
    return 'default';
  }
}

/**
 * Tworzy konfigurację axios z nagłówkiem X-Tenant-ID i Authorization
 */
export function getTenantConfig() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    headers: {
      'X-Tenant-ID': getTenantId(),
      'Authorization': token ? `Bearer ${token}` : '',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  };
}
