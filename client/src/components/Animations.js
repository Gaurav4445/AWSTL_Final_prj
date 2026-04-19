import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
    {children}
  </motion.div>
);

const StatsCard = ({ icon: Icon, title, value, subtitle, gradient = 'linear-gradient(135deg, #1c2b27 0%, #2d4a3e 100%)', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    style={{
      borderRadius: 18,
      padding: 24,
      background: gradient,
      color: '#ffffff',
      boxShadow: '0 12px 32px rgba(28,43,39,0.12)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <h3 style={{ margin: 0, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.78 }}>{title}</h3>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} />
      </div>
    </div>
    <p style={{ margin: 0, fontSize: 30, fontWeight: 800, fontFamily: "'Playfair Display', Georgia, serif" }}>{value}</p>
    {subtitle ? <p style={{ margin: '8px 0 0', fontSize: 13, opacity: 0.8 }}>{subtitle}</p> : null}
  </motion.div>
);

const AnimatedList = ({ items, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {items.map((item, idx) => (
      <motion.div key={item._id || idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05, duration: 0.3 }}>
        {children(item)}
      </motion.div>
    ))}
  </div>
);

export { PageTransition, StatsCard, AnimatedList };
