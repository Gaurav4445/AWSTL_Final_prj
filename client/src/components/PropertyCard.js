import React from 'react';
import { MapPin, Trash2, Edit2, ArrowRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { propertyImageForType } from '../utils/demoImages';

const TYPE_ACCENT = {
  'Apartment':        '#457b9d',
  'Independent House':'#2d6a4f',
  'Villa':            '#6b4c3b',
  'Studio':           '#c47f4e',
  'Row House':        '#9b2226',
  'Builder Floor':    '#4a4e69',
  'Bungalow':         '#2a9d8f',
};

export const PropertyCard = ({ property, onDelete, onEdit }) => {
  const accent = TYPE_ACCENT[property.propertyType] || '#1c2b27';

  return (
    <motion.div whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.14)' }} transition={{ duration: 0.2 }}
      style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid #e4ddd4', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <img
        src={property.coverImage?.dataUrl || propertyImageForType(property.propertyType)}
        alt={property.name}
        style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block', borderBottom: '1px solid #ece5db' }}
      />
      {/* Top accent bar */}
      <div style={{ height: 4, background: accent }} />

      <div style={{ padding: '20px 22px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Home size={20} color={accent} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1c2b27', margin: 0, lineHeight: 1.3 }}>{property.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <MapPin size={12} color="#6b7565" />
                <span style={{ fontSize: 13, color: '#6b7565' }}>{property.city}{property.state ? `, ${property.state}` : ''}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => onEdit(property)}
              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f2ebe1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Edit2 size={13} color="#6b7565" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => onDelete(property._id)}
              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={13} color="#dc2626" />
            </motion.button>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${accent}18`, color: accent }}>
            {property.propertyType}
          </span>
          {property.bhkType && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#f2ebe1', color: '#6b7565' }}>
              {property.bhkType}
            </span>
          )}
          {property.societyName && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#f2ebe1', color: '#6b7565', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {property.societyName}
            </span>
          )}
        </div>

        {/* Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18, paddingTop: 14, borderTop: '1px solid #f2ebe1' }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#9b8f85', textTransform: 'uppercase', margin: '0 0 3px' }}>Area</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1c2b27', margin: 0 }}>{property.squareFeet ? `${property.squareFeet} sq ft` : '—'}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#9b8f85', textTransform: 'uppercase', margin: '0 0 3px' }}>Floor</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1c2b27', margin: 0 }}>{property.floorNumber ? `Floor ${property.floorNumber}` : '—'}</p>
          </div>
          {property.pincode && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#9b8f85', textTransform: 'uppercase', margin: '0 0 3px' }}>Pincode</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1c2b27', margin: 0 }}>{property.pincode}</p>
            </div>
          )}
        </div>

        <Link to={`/property/${property._id}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', borderRadius: 10, background: '#1c2b27', color: '#f5ede4', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = accent}
          onMouseLeave={e => e.currentTarget.style.background = '#1c2b27'}
        >
          View Details <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
};
