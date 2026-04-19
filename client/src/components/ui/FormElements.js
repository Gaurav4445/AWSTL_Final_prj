import React from 'react';

const labelBaseStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: '#1c2b27',
  marginBottom: 8,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
};

const fieldBaseStyle = {
  display: 'block',
  width: '100%',
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

const Label = React.forwardRef(({ style, ...props }, ref) => <label ref={ref} style={{ ...labelBaseStyle, ...style }} {...props} />);
Label.displayName = 'Label';

const Textarea = React.forwardRef(({ style, rows = 3, ...props }, ref) => (
  <textarea ref={ref} rows={rows} style={{ ...fieldBaseStyle, minHeight: 96, resize: 'vertical', ...style }} {...props} />
));
Textarea.displayName = 'Textarea';

const Select = React.forwardRef(({ style, ...props }, ref) => (
  <select ref={ref} style={{ ...fieldBaseStyle, minHeight: 44, ...style }} {...props} />
));
Select.displayName = 'Select';

export { Label, Textarea, Select };
