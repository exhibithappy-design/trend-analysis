import { ReactNode, useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Send, Settings, LogOut, MessageSquare, LayoutDashboard, Sun, Moon, Menu, X, Image as ImageIcon } from 'lucide-react';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import '@/pages/admin/admin.css';
import ehLogo from '@/assets/exhibithappy-logo.svg.asset.json';

function NavRow({ to, icon, label, end, onNavigate }: { to: string; icon: ReactNode; label: string; end?: boolean; onNavigate?: () => void }) {
  return (
    <NavLink to={to} end={end} onClick={onNavigate} className={({ isActive }) => 'ad-nav-item' + (isActive ? ' active' : '')}>
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export default function AdminLayout() {
  const { loading, isAuthorized, user, role, signOut } = useAdminAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem('ad-theme') as 'light' | 'dark') || 'dark';
  });
  useEffect(() => {
    localStorage.setItem('ad-theme', theme);
  }, [theme]);

  if (loading) {
    return (
      <div data-admin>
        <div className="ad-login">
          <div style={{ color: '#888' }}>Loading…</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!isAuthorized) {
    return (
      <div data-admin>
        <div className="ad-login">
          <div className="ad-login-card">
            <h1>Access denied</h1>
            <p>
              Your email <strong>{user.email}</strong> isn't on the authorized list. Contact an administrator to be
              added.
            </p>
            <button className="ad-btn ad-btn-ghost" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-admin>
      <button
        className="ad-mobile-toggle"
        aria-label="Open menu"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={18} />
      </button>
      <div className={'ad-shell' + (mobileOpen ? ' is-mobile-open' : '')}>
        {mobileOpen && <div className="ad-mobile-scrim" onClick={() => setMobileOpen(false)} />}
        <aside className="ad-sidebar">
          <button
            className="ad-mobile-close"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
          <div className="ad-brand">
            <img src={ehLogo.url} alt="ExhibitHappy" className="ad-brand-logo" />
          </div>
          <NavRow to="/admin" end icon={<LayoutDashboard size={15} />} label="Dashboard" onNavigate={() => setMobileOpen(false)} />
          <NavRow to="/admin/chat" icon={<MessageSquare size={15} />} label="Research Lab" onNavigate={() => setMobileOpen(false)} />
          <NavRow to="/admin/distribution" icon={<Send size={15} />} label="Distribution" onNavigate={() => setMobileOpen(false)} />
          <NavRow to="/admin/header-images" icon={<ImageIcon size={15} />} label="Header Images" onNavigate={() => setMobileOpen(false)} />
          <NavRow to="/admin/settings" icon={<Settings size={15} />} label="Settings" onNavigate={() => setMobileOpen(false)} />

          <div className="ad-sidebar-footer">
            <div className="ad-user-chip">{role === 'admin' ? 'Admin' : 'Viewer'}</div>
            <div className="ad-user-email">{user.email}</div>
            <button
              className="ad-theme-toggle"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>
            <button className="ad-signout" onClick={signOut}>
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>
        <main className="ad-main" data-theme={theme}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
