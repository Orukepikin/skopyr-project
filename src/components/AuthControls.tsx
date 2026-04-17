import { useEffect, useState } from 'react';
import { getProviders, signIn, signOut, useSession } from 'next-auth/react';
import Button from './Button';

interface Props {
  onBrowse: () => void;
}

export default function AuthControls({ onBrowse }: Props) {
  const { data: session } = useSession();
  const [googleReady, setGoogleReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getProviders()
      .then((providers) => {
        if (active) {
          setGoogleReady(Boolean(providers?.google));
        }
      })
      .catch(() => {
        if (active) {
          setGoogleReady(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleGoogleSignIn = async () => {
    if (!googleReady) {
      setMessage('Google login needs GOOGLE_ID and GOOGLE_SECRET in your environment variables.');
      return;
    }

    setLoading(true);
    setMessage(null);
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
            <Button variant="outline" size="sm" onClick={handleGoogleSignIn} disabled={loading}>
              {loading ? 'Redirecting...' : 'Sign in with Google'}
            </Button>
            <Button size="sm" onClick={handleGoogleSignIn} disabled={loading}>
              Join as provider
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
