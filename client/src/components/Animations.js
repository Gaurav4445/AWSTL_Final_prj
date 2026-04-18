import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

const StatsCard = ({ icon: Icon, title, value, subtitle, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    viewport={{ once: true }}
    className={`rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 ${gradient}`}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-gray-700 font-semibold text-sm">{title}</h3>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${gradient.split(' ')[2]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-600 mt-2">{subtitle}</p>
  </motion.div>
);

const AnimatedList = ({ items, children }) => (
  <motion.div className="space-y-3">
    {items.map((item, idx) => (
      <motion.div
        key={item._id || idx}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.05, duration: 0.3 }}
        viewport={{ once: true }}
      >
        {children(item)}
      </motion.div>
    ))}
  </motion.div>
);

export { PageTransition, StatsCard, AnimatedList };
