import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Home, Building2, ClipboardList, History, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/',           label: 'Dashboard',  icon: Home },
  { to: '/properties', label: 'Properties', icon: Building2 },
  { to: '/tasks',      label: 'Tasks',      icon: ClipboardList },
  { to: '/history',    label: 'History',    icon: History },
  { to: '/vendors',    label: 'Vendors',    icon: Users },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside style={{
        width: 220,
        minWidth: 220,
        background: '#1c2b27',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }} className="hidden md:flex">

        {/* Logo */}
        <div style={{ padding: '28px 20px 20px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#f5ede4', letterSpacing: '-0.2px' }}>
              Ghar<span style={{ color: '#c47f4e', fontStyle: 'italic' }}>Seva</span>
            </span>
          </Link>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(245,237,228,0.38)', marginTop: 4, lineHeight: 1.4 }}>
            HOME MAINTENANCE, CARE-<br />FULLY KEPT
          </p>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '8px 12px' }}>
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px',
                  borderRadius: 10,
                  marginBottom: 4,
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#f5ede4' : 'rgba(245,237,228,0.55)',
                  background: active ? '#c47f4e' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#f5ede4', margin: '0 0 2px' }}>{user?.name || 'User'}</p>
          <p style={{ fontSize: 11, color: 'rgba(245,237,228,0.45)', margin: '0 0 14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8,
              color: 'rgba(245,237,228,0.7)',
              fontSize: 13, fontWeight: 500,
              padding: '8px 14px',
              cursor: 'pointer',
              width: '100%',
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile topbar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: '#1c2b27',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 56,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }} className="flex md:hidden">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#f5ede4' }}>
            Ghar<span style={{ color: '#c47f4e', fontStyle: 'italic' }}>Seva</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', color: '#f5ede4', cursor: 'pointer', padding: 4 }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: -240, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -240, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed', top: 56, left: 0, bottom: 0, width: 220,
              background: '#1c2b27', zIndex: 99, padding: '12px',
              fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            }}
          >
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 10, marginBottom: 4,
                  fontSize: 14, fontWeight: location.pathname === to ? 600 : 400,
                  color: location.pathname === to ? '#f5ede4' : 'rgba(245,237,228,0.55)',
                  background: location.pathname === to ? '#c47f4e' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                <Icon size={16} /> {label}
              </Link>
            ))}
            <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#f5ede4', margin: '0 0 2px', paddingLeft: 4 }}>{user?.name}</p>
              <p style={{ fontSize: 11, color: 'rgba(245,237,228,0.45)', margin: '0 0 12px', paddingLeft: 4 }}>{user?.email}</p>
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8, color: 'rgba(245,237,228,0.7)', fontSize: 13, fontWeight: 500,
                padding: '8px 14px', cursor: 'pointer', width: '100%', fontFamily: 'inherit',
              }}>
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};