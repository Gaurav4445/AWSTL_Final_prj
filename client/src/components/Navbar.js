import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Home, Building2, ClipboardList, History, Users, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/',           label: 'Dashboard', icon: Home },
  { to: '/properties', label: 'Properties', icon: Building2 },
  { to: '/tasks',      label: 'Tasks',      icon: ClipboardList },
  { to: '/history',    label: 'History',    icon: History },
  { to: '/vendors',    label: 'Kaarigar',   icon: Users },
];

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5" />
            </div>
            <span>GharSeva</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    active ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* User + Logout */}
          <div className="hidden md:flex items-center gap-3 border-l border-white/20 pl-4">
            <div className="text-right">
              <p className="text-sm font-semibold">{user?.name || 'User'}</p>
              <p className="text-xs text-white/70">{user?.city || 'India'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-white/10" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-white/20 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  location.pathname === to ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <div className="border-t border-white/20 pt-3 mt-3 px-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-xs text-white/70">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg text-sm">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};