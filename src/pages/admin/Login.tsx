import { FormEvent, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import '@/pages/admin/admin.css';
import ehLogo from '@/assets/exhibithappy-logo.svg.asset.json';
import bgTexture from '@/assets/black-background.jpg.asset.json';

export default function AdminLogin() {
  const { user, loading } = useAdminAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    document.title = 'Admin sign-in';
  }, []);

  if (!loading && user) return <Navigate to="/admin/editions" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    const creds = { email: email.trim(), password };
    const { error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword(creds)
        : await supabase.auth.signUp({
            ...creds,
            options: { emailRedirectTo: `${window.location.origin}/admin/editions` },
          });
    setBusy(false);
    if (error) {
      setMsg({ kind: 'err', text: error.message });
    } else if (mode === 'signup') {
      setMsg({ kind: 'ok', text: 'Account created — signing you in…' });
    }
  }

  return (
    <div data-admin>
      <div className="ad-login">
        <div
          className="ad-login-bg"
          aria-hidden="true"
          style={{ backgroundImage: `url(${bgTexture.url})` }}
        >
          <span className="ad-login-overlay" />
        </div>
        <div className="ad-login-stack">
          <img src={ehLogo.url} alt="ExhibitHappy" className="ad-login-logo" />
          <div className="ad-login-card ad-glass">
            <h1>
              <span style={{ color: '#FF0069' }}>●</span> Steelhead admin
            </h1>
            <p>
              {mode === 'signin'
                ? 'Sign in with your authorized email and password.'
                : 'Create your account with an authorized email.'}
            </p>
            <form onSubmit={onSubmit}>
              <input
                className="ad-input"
                type="email"
                placeholder="you@steelheaddesign.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
              <div className="ad-pw-wrap">
                <input
                  className="ad-input ad-pw-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="ad-pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button className="ad-btn" type="submit" disabled={busy || !email || !password}>
                {busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>
            {msg && <div className={`msg ${msg.kind}`}>{msg.text}</div>}
            <div className="ad-login-switch">
              {mode === 'signin' ? (
                <>
                  Need an account?{' '}
                  <button type="button" onClick={() => { setMode('signup'); setMsg(null); }}>
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setMode('signin'); setMsg(null); }}>
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
