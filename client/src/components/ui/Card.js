import React from 'react';

const Card = React.forwardRef(({ style, ...props }, ref) => (
  <div ref={ref} style={{ background: '#ffffff', border: '1px solid #e4ddd4', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', ...style }} {...props} />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ style, ...props }, ref) => (
  <div ref={ref} style={{ padding: 24, borderBottom: '1px solid #f1ebe2', ...style }} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ style, ...props }, ref) => (
  <div ref={ref} style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1c2b27', ...style }} {...props} />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ style, ...props }, ref) => (
  <p ref={ref} style={{ margin: '8px 0 0', fontSize: 14, color: '#6b7565', ...style }} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ style, ...props }, ref) => (
  <div ref={ref} style={{ padding: 24, ...style }} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ style, ...props }, ref) => (
  <div ref={ref} style={{ padding: 24, borderTop: '1px solid #f1ebe2', ...style }} {...props} />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
