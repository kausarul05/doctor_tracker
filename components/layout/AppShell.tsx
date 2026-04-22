'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutDashboard, Stethoscope, Users, LogOut, Menu, X, Bell, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/doctors ss',   icon: Stethoscope,    label: 'Doctors'   },
  { href: '/patients',  icon: Users,           label: 'Patients'  },
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard',   subtitle: 'Overview & analytics'   },
  '/doctors':   { title: 'Doctors',     subtitle: 'Manage medical staff'    },
  '/patients':  { title: 'Patients',    subtitle: 'Manage patient records'  },
};

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${open ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
              <Activity size={17} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Doctor Tracker</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Admin Portal</div>
            </div>
          </div>
          {/* Close btn — mobile only */}
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          <p style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '8px 10px', marginBottom: '4px' }}>Menu</p>
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href} onClick={onClose} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px', marginBottom: '2px',
                fontSize: '14px', fontWeight: active ? '600' : '400',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                border: active ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                textDecoration: 'none', transition: 'all 0.15s',
              }}>
                <Icon size={17} color={active ? 'var(--brand)' : 'var(--text-muted)'} />
                {label}
                {active && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand)' }} />}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', width: '100%', fontSize: '14px', color: 'var(--text-secondary)', background: 'none', border: '1px solid transparent', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-body)' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='rgba(244,63,94,0.08)'; el.style.color='var(--rose)'; el.style.borderColor='rgba(244,63,94,0.15)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='none'; el.style.color='var(--text-secondary)'; el.style.borderColor='transparent'; }}
          >
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const base = '/' + pathname.split('/')[1];
  const page = pageTitles[base] || { title: 'Doctor Tracker', subtitle: '' };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="hamburger" onClick={onMenuClick}>
          <Menu size={18} />
        </button>
        <div className="topbar-title">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}>
            {page.title}
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{page.subtitle}</p>
        </div>
        {/* Mobile: just show title without subtitle */}
        <div style={{ display: 'none' }} className="topbar-title-mobile">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{page.title}</h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--bg-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', position: 'relative' }}>
          <Bell size={15} />
          <span style={{ position: 'absolute', top: '7px', right: '7px', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--brand)', border: '1.5px solid var(--bg-1)' }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px 5px 5px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '10px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={13} color="white" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: 1 }}>{session?.user?.name || 'Admin'}</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
