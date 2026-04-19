import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationAPI } from '../services/api';
import { timeAgo } from '../utils/dateUtils';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll();
      setNotifications(response.data.data || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notification) => {
    if (notification.read) return;
    try {
      await notificationAPI.markAsRead(notification._id);
      setNotifications((prev) =>
        prev.map((item) => (item._id === notification._id ? { ...item, read: true } : item))
      );
    } catch {
      // no-op
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch {
      // no-op
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={iconButtonStyle}
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && <span style={badgeStyle}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1c2b27' }}>Notifications</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7565' }}>Recent updates from your home workspace</p>
            </div>
            {notifications.length > 0 && unreadCount > 0 && (
              <button type="button" onClick={handleMarkAllAsRead} style={markAllButtonStyle}>
                <CheckCheck size={14} /> Mark all
              </button>
            )}
          </div>

          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {loading ? (
              <div style={emptyStateStyle}>Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div style={emptyStateStyle}>No notifications yet</div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => handleMarkAsRead(notification)}
                  style={{
                    ...itemStyle,
                    background: notification.read ? '#ffffff' : '#f8efe6',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1c2b27' }}>{notification.title}</p>
                      <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6b7565', lineHeight: 1.5 }}>{notification.message}</p>
                    </div>
                    {!notification.read && <span style={dotStyle} />}
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 11, color: '#9b8f85' }}>{timeAgo(notification.createdAt)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const iconButtonStyle = {
  position: 'relative',
  width: 36,
  height: 36,
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(255,255,255,0.08)',
  color: '#f5ede4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const badgeStyle = {
  position: 'absolute',
  top: -4,
  right: -4,
  minWidth: 18,
  height: 18,
  borderRadius: 999,
  background: '#c47f4e',
  color: '#ffffff',
  fontSize: 10,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 5px',
};

const panelStyle = {
  position: 'absolute',
  top: 'calc(100% + 10px)',
  right: 0,
  width: 320,
  borderRadius: 16,
  background: '#ffffff',
  border: '1px solid #e4ddd4',
  boxShadow: '0 18px 42px rgba(28,43,39,0.18)',
  overflow: 'hidden',
  zIndex: 120,
};

const panelHeaderStyle = {
  padding: '16px 18px',
  borderBottom: '1px solid #f1ebe2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
};

const markAllButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  border: 'none',
  background: '#f2ebe1',
  color: '#1c2b27',
  borderRadius: 999,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
};

const itemStyle = {
  width: '100%',
  textAlign: 'left',
  border: 'none',
  borderBottom: '1px solid #f1ebe2',
  padding: '14px 18px',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const emptyStateStyle = {
  padding: '28px 18px',
  textAlign: 'center',
  fontSize: 13,
  color: '#6b7565',
};

const dotStyle = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: '#c47f4e',
  marginTop: 6,
  flexShrink: 0,
};
