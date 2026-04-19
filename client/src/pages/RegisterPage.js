import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  password: '',
  confirmPassword: '',
};

export const RegisterPage = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.phone.trim(),
        formData.password,
        formData.city.trim(),
        formData.state.trim()
      );
      toast.success('Account created successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
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
        className="auth-panel-left"
      >
        <div
          style={{
            position: 'absolute',
            top: -90,
            right: -90,
            width: 320,
            height: 320,
            background: 'radial-gradient(circle, rgba(196,127,78,0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

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
            Build a smarter memory
            <br />
            for your <em style={{ color: '#c47f4e', fontStyle: 'italic' }}>home.</em>
          </motion.h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              'Track every service, repair, and maintenance cycle',
              'Know what is due next before it becomes a costly problem',
              'Keep vendors, costs, and property records in one calm workspace',
            ].map((text) => (
              <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{ color: '#c47f4e', fontSize: 18, lineHeight: 1.55, flexShrink: 0 }}>-</span>
                <span style={{ fontSize: 15, color: 'rgba(245,237,228,0.72)', lineHeight: 1.65 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(245,237,228,0.38)', letterSpacing: '0.02em' }}>
          Built in India · For Indian homes
        </p>
      </motion.div>

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
        <div style={{ width: '100%', maxWidth: 520 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: 38,
                fontWeight: 700,
                color: '#1c2b27',
                marginBottom: 8,
                letterSpacing: '-0.5px',
              }}
            >
              Create account
            </h2>
            <p style={{ fontSize: 15, color: '#6b7565', marginBottom: 32, lineHeight: 1.5 }}>
              Start tracking maintenance before small tasks become expensive repairs.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>FULL NAME</label>
                <input name="name" value={formData.name} onChange={handleChange} required placeholder="Praasadd" style={inputStyle} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>EMAIL</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>PHONE</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="9876543210" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>STATE</label>
                <input name="state" value={formData.state} onChange={handleChange} placeholder="Maharashtra" style={inputStyle} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>CITY</label>
                <input name="city" value={formData.city} onChange={handleChange} placeholder="Pune" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>PASSWORD</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} placeholder="At least 6 characters" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>CONFIRM PASSWORD</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength={6} placeholder="Repeat password" style={inputStyle} />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.015 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                style={{
                  gridColumn: '1 / -1',
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
                  marginTop: 4,
                }}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </motion.button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6b7565' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#1c2b27', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Sign in
              </Link>
            </p>
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
