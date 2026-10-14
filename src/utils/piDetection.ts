export const isPiBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const ua = (navigator.userAgent || '').toLowerCase();
    return ua.includes('pibrowser') || !!(window as any).__PI_BROWSER__;
  } catch {
    return false;
  }
};
