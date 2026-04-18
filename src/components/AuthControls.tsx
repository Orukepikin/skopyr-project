import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import type { DashboardRole } from '@/lib/dashboard';
import { isGoogleProviderAvailable } from '@/lib/googleAuth';
import Button from './Button';

interface Props {
  onBrowse: () => void;
  onDashboard: (role: DashboardRole) => void;
  compact?: boolean;
}

export default function AuthControls({ onBrowse, onDashboard, compact = false }: Props) {
  const { data: session } = useSession();
  const [googleReady, setGoogleReady] = useState(false);
  const [checkingGoogle, setCheckingGoogle] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    isGoogleProviderAvailable()
      .then((available) => {
        if (!active) {
          return;
        }

        setGoogleReady(available);
      })
      .catch(() => {
        if (active) {
          setGoogleReady(false);
        }
      })
      .finally(() => {
        if (active) {
          setCheckingGoogle(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleGoogleSignIn = async (role: DashboardRole) => {
    setLoading(true);
    setMessage(null);

    const ready = googleReady || (await isGoogleProviderAvailable().catch(() => false));

    setGoogleReady(ready);
    setCheckingGoogle(false);

    if (!ready) {
      setLoading(false);
      setMessage("Google sign-in isn't available right now. Refresh and try again.");
      return;
    }

    window.localStorage.setItem('skopyr:return-screen', 'dashboard');
    window.localStorage.setItem('skopyr:return-role', role);
    await signIn('google');
  };

  const handleSignOut = async () => {
    setLoading(true);
    setMessage(null);
    await signOut({ callbackUrl: '/' });
  };

  const buttonStyle = compact
    ? {
        width: '100%',
        minHeight: 42,
        padding: '10px 12px',
        lineHeight: 1.2,
      }
    : undefined;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: compact ? 'stretch' : 'flex-end',
        gap: 10,
        width: compact ? '100%' : 'auto',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? 'repeat(2, minmax(0, 1fr))' : 'auto',
          gap: 8,
          justifyContent: compact ? 'stretch' : 'flex-end',
          width: compact ? '100%' : 'auto',
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onBrowse}
          style={{
            ...(compact ? { gridColumn: '1 / -1' } : null),
            ...buttonStyle,
          }}
        >
          Browse jobs
        </Button>

        {session?.user ? (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled
              style={{
                opacity: 1,
                ...(compact ? { gridColumn: '1 / -1' } : null),
                ...buttonStyle,
              }}
            >
              {session.user.name || session.user.email || 'Signed in'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDashboard('customer')}
              style={buttonStyle}
            >
              My profile
            </Button>
            <Button size="sm" onClick={handleSignOut} disabled={loading} style={buttonStyle}>
              {loading ? 'Signing out...' : 'Sign out'}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGoogleSignIn('customer')}
              disabled={loading || checkingGoogle}
              style={buttonStyle}
            >
              {loading ? 'Redirecting...' : checkingGoogle ? 'Checking Google...' : 'Sign in with Google'}
            </Button>
            <Button
              size="sm"
              onClick={() => handleGoogleSignIn('provider')}
              disabled={loading || checkingGoogle}
              style={buttonStyle}
            >
              {loading ? 'Redirecting...' : checkingGoogle ? 'Checking Google...' : 'Join as provider'}
            </Button>
          </>
        )}
      </div>

      {message && (
        <span
          style={{
            color: 'rgba(255,255,255,0.72)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            maxWidth: compact ? '100%' : 280,
            textAlign: compact ? 'center' : 'right',
          }}
        >
          {message}
        </span>
      )}
    </div>
  );
}
