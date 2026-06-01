import { FormEvent, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import '@/pages/admin/admin.css';
import ehLogo from '@/assets/exhibithappy-logo.svg.asset.json';

export default function AdminLogin() {
  const { user, loading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    document.title = 'Admin sign-in';
  }, []);

  if (!loading && user) return <Navigate to="/admin/editions" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSending(true);
    // Check allowlist first to give a clean rejection
    const { data: allow, error: allowErr } = await supabase
      .from('authorized_emails')
      .select('email')
      .ilike('email', email.trim())
      .maybeSingle();
    if (allowErr || !allow) {
      // The select runs as anon, so the policy will block it; instead just attempt sign-in
      // and rely on the post-callback trigger + role check to enforce access.
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/admin/editions`,
        shouldCreateUser: true,
      },
    });
    setSending(false);
    if (error) {
      setMsg({ kind: 'err', text: error.message });
    } else {
      setMsg({ kind: 'ok', text: 'Check your email — a magic sign-in link is on its way.' });
    }
  }

  return (
    <div data-admin>
      <div className="ad-login">
        <div className="ad-login-stack">
          <img src={ehLogo.url} alt="ExhibitHappy" className="ad-login-logo" />
          <div className="ad-login-card">
          <h1>
            <span style={{ color: '#FF0069' }}>●</span> Steelhead admin
          </h1>
          <p>Enter your authorized email. We'll send you a one-time magic link — no password required.</p>
          <form onSubmit={onSubmit}>
            <input
              className="ad-input"
              type="email"
              placeholder="you@steelheaddesign.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <button className="ad-btn" type="submit" disabled={sending || !email}>
              {sending ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
          {msg && <div className={`msg ${msg.kind}`}>{msg.text}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
