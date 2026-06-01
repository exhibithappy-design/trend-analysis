import { ReactNode } from 'react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Send, Settings, LogOut, FileText, Library, Activity, Sparkles, MessageSquare, LayoutDashboard } from 'lucide-react';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import '@/pages/admin/admin.css';
import ehLogo from '@/assets/exhibithappy-logo.svg.asset.json';

function NavRow({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => 'ad-nav-item' + (isActive ? ' active' : '')}>
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export default function AdminLayout() {
  const { loading, isAuthorized, user, role, signOut } = useAdminAuth();
  const location = useLocation();

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
      <div className="ad-shell">
        <aside className="ad-sidebar">
          <div className="ad-brand">
            <img src={ehLogo.url} alt="ExhibitHappy" className="ad-brand-logo" />
          </div>
          <NavRow to="/admin" icon={<LayoutDashboard size={15} />} label="Dashboard" />
          <NavRow to="/admin/editions" icon={<FileText size={15} />} label="Editions" />
          <NavRow to="/admin/distribution" icon={<Send size={15} />} label="Distribution" />
          <NavRow to="/admin/content" icon={<Library size={15} />} label="Content library" />
          <NavRow to="/admin/aeo" icon={<Activity size={15} />} label="AEO health" />
          <NavRow to="/admin/insights" icon={<Sparkles size={15} />} label="AI insights" />
          <NavRow to="/admin/chat" icon={<MessageSquare size={15} />} label="AI chat" />
          <NavRow to="/admin/settings" icon={<Settings size={15} />} label="Settings" />

          <div className="ad-sidebar-footer">
            <div className="ad-user-chip">{role === 'admin' ? 'Admin' : 'Viewer'}</div>
            <div className="ad-user-email">{user.email}</div>
            <button className="ad-nav-item" onClick={signOut} style={{ textAlign: 'left' }}>
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>
        <main className="ad-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
