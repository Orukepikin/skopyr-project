import { signOut, useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000;
const ACTIVITY_SYNC_THROTTLE_MS = 15 * 1000;
const ACTIVITY_STORAGE_KEY = 'skopyr:last-activity-at';

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  'click',
  'focus',
  'keydown',
  'mousedown',
  'mousemove',
  'scroll',
  'touchstart',
];

export default function SessionInactivityGuard() {
  const { status } = useSession();
  const lastSyncedActivityRef = useRef(0);
  const signingOutRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || status !== 'authenticated') {
      signingOutRef.current = false;
      return;
    }

    const syncActivity = (force = false) => {
      const now = Date.now();

      if (!force && now - lastSyncedActivityRef.current < ACTIVITY_SYNC_THROTTLE_MS) {
        return;
      }

      lastSyncedActivityRef.current = now;
      window.localStorage.setItem(ACTIVITY_STORAGE_KEY, String(now));
    };

    const handleActivity = () => {
      syncActivity();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncActivity(true);
      }
    };

    const checkForExpiry = () => {
      if (signingOutRef.current) {
        return;
      }

      const rawLastActivity = window.localStorage.getItem(ACTIVITY_STORAGE_KEY);
      const lastActivityAt = rawLastActivity ? Number.parseInt(rawLastActivity, 10) : Date.now();

      if (!Number.isFinite(lastActivityAt)) {
        syncActivity(true);
        return;
      }

      if (Date.now() - lastActivityAt < INACTIVITY_TIMEOUT_MS) {
        return;
      }

      signingOutRef.current = true;
      window.localStorage.removeItem(ACTIVITY_STORAGE_KEY);
      void signOut({ callbackUrl: `${window.location.origin}/` });
    };

    syncActivity(true);
    const intervalId = window.setInterval(checkForExpiry, 30 * 1000);

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('storage', checkForExpiry);

    return () => {
      window.clearInterval(intervalId);
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('storage', checkForExpiry);
    };
  }, [status]);

  return null;
}
