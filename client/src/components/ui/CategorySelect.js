import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const SPEC_COLORS = {
  'Plumber': '#457b9d',
  'Electrician': '#2a9d8f',
  'AC Mechanic': '#c47f4e',
  'Carpenter': '#6b4c3b',
  'Painter': '#9b2226',
  'Pest Control': '#7f8c8d',
  'Cleaning Service': '#52796f',
  'RO Technician': '#b08968',
  'Inverter/Battery': '#1d3557',
  'Gas Agency': '#e76f51',
  'Security': '#4a4e69',
  'General Handyman': '#6c757d',
};

export const CategorySelect = ({ value, onChange, categories = [], label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedColor = SPEC_COLORS[value] || '#6b7565';

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          height: 44,
          borderRadius: 10,
          border: `2px solid ${value ? selectedColor : '#d8d1c7'}`,
          background: value ? `${selectedColor}15` : '#ffffff',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          fontSize: 14,
          fontFamily: 'inherit',
          transition: 'all 0.2s ease',
          color: value ? selectedColor : '#9b8f85',
          fontWeight: value ? 600 : 400,
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = '#c0b9ae';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = value ? selectedColor : '#d8d1c7';
        }}
      >
        <span>{value || 'Select Category'}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} color={selectedColor} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 8,
              background: '#ffffff',
              borderRadius: 12,
              border: '2px solid #e4ddd4',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              zIndex: 50,
              maxHeight: 300,
              overflowY: 'auto',
            }}
          >
            {categories.map((category, idx) => {
              const categoryColor = SPEC_COLORS[category] || '#6b7565';
              const isSelected = value === category;

              return (
                <motion.button
                  key={category}
                  type="button"
                  onClick={() => {
                    onChange({ target: { value: category } });
                    setIsOpen(false);
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: isSelected ? `${categoryColor}20` : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 14,
                    color: isSelected ? categoryColor : '#1c2b27',
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: 0,
                    transition: 'background 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${categoryColor}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isSelected ? `${categoryColor}20` : 'transparent';
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: categoryColor,
                      flexShrink: 0,
                    }}
                  />
                  {category}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};