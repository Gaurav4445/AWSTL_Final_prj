import React from 'react';

const baseStyle = {
  display: 'block',
  width: '100%',
  minHeight: 44,
  borderRadius: 10,
  border: '1.5px solid #d8d1c7',
  background: '#ffffff',
  padding: '10px 14px',
  fontSize: 14,
  color: '#1c2b27',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

const Input = React.forwardRef(({ style, type = 'text', ...props }, ref) => (
  <input type={type} ref={ref} style={{ ...baseStyle, ...style }} {...props} />
));

Input.displayName = 'Input';

export { Input };
