import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: 'demo@gharseva.in',
    password: 'demo1234',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* LEFT PANEL */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          width: '48%',
          background: '#1c2b27',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', bottom: -80, left: -80,
          width: 360, height: 360,
          background: 'radial-gradient(circle, rgba(196,127,78,0.18) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#f5ede4', letterSpacing: '-0.3px' }}>
            Ghar<span style={{ color: '#c47f4e', fontStyle: 'italic' }}>Seva</span>
          </span>
        </div>

        <div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: 'clamp(34px, 3.5vw, 54px)',
              fontWeight: 800,
              lineHeight: 1.12,
              color: '#f5ede4',
              marginBottom: 32,
            }}
          >
            Every home has a{' '}
            <em style={{ color: '#c47f4e', fontStyle: 'italic' }}>rhythm.</em>
            <br />We help you keep it.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {[
              'Track AC, RO, plumbing & more across every property',
              'Never miss a due-date with a clear monthly view',
              'Your trusted vendors, costs & warranties — in one place',
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{ color: '#c47f4e', fontSize: 18, lineHeight: 1.55, flexShrink: 0 }}>—</span>
                <span style={{ fontSize: 15, color: 'rgba(245,237,228,0.72)', lineHeight: 1.65 }}>{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ fontSize: 12, color: 'rgba(245,237,228,0.38)', letterSpacing: '0.02em' }}
        >
          Built in India · For Indian homes
        </motion.p>
      </motion.div>

      {/* RIGHT PANEL */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          flex: 1,
          background: '#f2ebe1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 40px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <h2 style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: 38,
              fontWeight: 700,
              color: '#1c2b27',
              marginBottom: 8,
              letterSpacing: '-0.5px',
            }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 15, color: '#6b7565', marginBottom: 40, lineHeight: 1.5 }}>
              Sign in to your GharSeva account.
            </p>

            <form onSubmit={handleSubmit}>
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                style={{ marginBottom: 20 }}
              >
                <label style={labelStyle}>EMAIL</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#1c2b27'; e.target.style.boxShadow = '0 0 0 3px rgba(28,43,39,0.10)'; }}
                  onBlur={e => { e.target.style.borderColor = '#d8d1c7'; e.target.style.boxShadow = 'none'; }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.42, duration: 0.4 }}
                style={{ marginBottom: 32 }}
              >
                <label style={labelStyle}>PASSWORD</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#1c2b27'; e.target.style.boxShadow = '0 0 0 3px rgba(28,43,39,0.10)'; }}
                  onBlur={e => { e.target.style.borderColor = '#d8d1c7'; e.target.style.boxShadow = 'none'; }}
                />
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.015 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: loading ? '#3a5a50' : '#1c2b27',
                  color: '#f5ede4',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  letterSpacing: '0.01em',
                  fontFamily: 'inherit',
                }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </motion.button>
            </form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6b7565' }}
            >
              New here?{' '}
              <Link
                to="/register"
                style={{ color: '#1c2b27', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                Create an account
              </Link>
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.4 }}
              style={{
                marginTop: 28,
                padding: '12px 16px',
                background: 'rgba(28,43,39,0.07)',
                borderRadius: 8,
                fontSize: 12,
                color: '#6b7565',
                lineHeight: 1.7,
              }}
            >
              Demo login pre-filled · demo@gharseva.in / demo1234
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.1em',
  color: '#4a5549',
  marginBottom: 8,
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  fontSize: 15,
  background: '#ffffff',
  border: '1.5px solid #d8d1c7',
  borderRadius: 10,
  color: '#1c2b27',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};