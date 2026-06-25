import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Brand from './Brand';
import { useAuth } from '../context/AuthContext';

export default function TopNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSignOut() {
    signOut();
    navigate('/signin');
  }

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '??';

  return (
    <nav className="top-nav" role="navigation" aria-label="Main navigation">
      <div className="top-nav-inner">
        <Brand />
        <div className="nav-right">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/help"      className="nav-link">Help</Link>

          <div className="user-menu-wrap" ref={menuRef}>
            <button
              className="user-menu-btn"
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={open}
              aria-label="Account menu"
            >
              <div className="user-avatar">{initials}</div>
              <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.firstName ?? 'Account'}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" style={{ stroke:'var(--gray-500)', fill:'none', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {open && (
              <div className="user-dropdown" role="menu">
                <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--gray-200)' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-800)' }}>
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                    {user?.email}
                  </div>
                </div>
                <button className="user-dropdown-item" role="menuitem" onClick={() => { setOpen(false); navigate('/dashboard'); }}>
                  <PersonIcon /> My Account
                </button>
                <button className="user-dropdown-item" role="menuitem" onClick={() => { setOpen(false); navigate('/help'); }}>
                  <HelpIcon /> Help & Support
                </button>
                <button className="user-dropdown-item" role="menuitem" onClick={() => { setOpen(false); navigate('/privacy'); }}>
                  <ShieldIcon /> Privacy & Legal
                </button>
                <div className="dropdown-divider" />
                <button className="user-dropdown-item danger" role="menuitem" onClick={handleSignOut}>
                  <LogOutIcon /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

const PersonIcon  = () => <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const HelpIcon    = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const ShieldIcon  = () => <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const LogOutIcon  = () => <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
