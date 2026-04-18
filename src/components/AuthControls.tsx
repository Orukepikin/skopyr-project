import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { isGoogleProviderAvailable } from '@/lib/googleAuth';
import Button from './Button';

interface Props {
  onBrowse: () => void;
}

export default function AuthControls({ onBrowse }: Props) {
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

  const handleGoogleSignIn = async () => {
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

    await signIn('google');
  };

  const handleSignOut = async () => {
    setLoading(true);
    setMessage(null);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <Button variant="ghost" size="sm" onClick={onBrowse}>
          Browse jobs
        </Button>

        {session?.user ? (
          <>
            <Button variant="outline" size="sm" disabled style={{ opacity: 1 }}>
              {session.user.name || session.user.email || 'Signed in'}
            </Button>
            <Button size="sm" onClick={handleSignOut} disabled={loading}>
              {loading ? 'Signing out...' : 'Sign out'}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoogleSignIn}
              disabled={loading || checkingGoogle}
            >
              {loading ? 'Redirecting...' : checkingGoogle ? 'Checking Google...' : 'Sign in with Google'}
            </Button>
            <Button size="sm" onClick={handleGoogleSignIn} disabled={loading || checkingGoogle}>
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
            maxWidth: 280,
            textAlign: 'right',
          }}
        >
          {message}
        </span>
      )}
    </div>
  );
}
