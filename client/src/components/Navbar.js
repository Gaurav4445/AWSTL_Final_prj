// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-90">
            <Home className="w-6 h-6" />
            <span>HomeMaint</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="hover:opacity-80 transition">Dashboard</Link>
            <Link to="/properties" className="hover:opacity-80 transition">Properties</Link>
            <Link to="/history" className="hover:opacity-80 transition">History</Link>

            <div className="flex items-center gap-3 border-l border-orange-400 pl-8">
              <span className="text-sm font-medium">{user?.name || 'User'}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-orange-700 hover:bg-orange-800 px-4 py-2 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-orange-400">
            <Link
              to="/"
              className="block py-3 px-4 hover:bg-orange-700 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/properties"
              className="block py-3 px-4 hover:bg-orange-700 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Properties
            </Link>
            <Link
              to="/history"
              className="block py-3 px-4 hover:bg-orange-700 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              History
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left py-3 px-4 hover:bg-orange-700 rounded flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};