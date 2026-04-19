import React from 'react';

const variantStyles = {
  default: {
    background: '#1c2b27',
    color: '#ffffff',
    border: 'none',
  },
  secondary: {
    background: '#e4ddd4',
    color: '#1c2b27',
    border: 'none',
  },
  destructive: {
    background: '#dc2626',
    color: '#ffffff',
    border: 'none',
  },
  outline: {
    background: '#ffffff',
    color: '#1c2b27',
    border: '1px solid #d8d1c7',
  },
  ghost: {
    background: 'transparent',
    color: '#1c2b27',
    border: 'none',
  },
};

const sizeStyles = {
  default: { minHeight: 40, padding: '10px 16px', fontSize: 14 },
  sm: { minHeight: 34, padding: '8px 12px', fontSize: 13 },
  lg: { minHeight: 46, padding: '12px 20px', fontSize: 15 },
  icon: { width: 40, height: 40, padding: 0 },
};

const Button = React.forwardRef(({ style, variant = 'default', size = 'default', type = 'button', ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 10,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'all 0.2s ease',
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    }}
    {...props}
  />
));

Button.displayName = 'Button';

export { Button };
