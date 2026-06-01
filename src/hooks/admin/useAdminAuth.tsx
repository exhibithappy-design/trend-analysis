import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type Role = 'admin' | 'viewer' | null;

type Ctx = {
  session: Session | null;
  user: User | null;
  role: Role;
  loading: boolean;
  isAuthorized: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) {
        setRole(null);
        setLoading(false);
      } else {
        // Defer role lookup
        setTimeout(() => fetchRole(s.user.id), 0);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchRole(data.session.user.id);
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function fetchRole(uid: string) {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', uid);
    if (data && data.length) {
      const roles = data.map((r) => r.role);
      setRole(roles.includes('admin') ? 'admin' : roles.includes('viewer') ? 'viewer' : null);
    } else {
      setRole(null);
    }
    setLoading(false);
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
  };

  return (
    <AuthCtx.Provider
      value={{
        session,
        user: session?.user ?? null,
        role,
        loading,
        isAuthorized: !!role,
        isAdmin: role === 'admin',
        signOut,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
}
