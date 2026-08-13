const PERMISSION_ASKED_KEY = 'zoadex_push_permission_asked';

export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  const currentPermission = Notification.permission;

  if (currentPermission === 'granted') {
    return true;
  }

  if (currentPermission === 'denied') {
    return false;
  }

  // Only ask once per session
  if (sessionStorage.getItem(PERMISSION_ASKED_KEY)) {
    return false;
  }

  sessionStorage.setItem(PERMISSION_ASKED_KEY, 'true');

  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function showLocalNotification(title: string, body: string, icon?: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  new Notification(title, {
    body,
    icon: icon ?? '/favicon.svg',
    badge: '/pwa-192x192.svg',
  });
}

export function subscribeToPush(): void {
  // Placeholder for future server-side push subscription
  console.log('[ZoaDex] Push subscription placeholder — server-side push not yet implemented');
}
