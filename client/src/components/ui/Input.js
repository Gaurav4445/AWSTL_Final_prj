import React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input
    type={type}
    className={cn(
      'flex h-11 w-full rounded-10 border border-[#d8d1c7] bg-white px-4 py-2 text-sm text-[#1c2b27] placeholder:text-[#9b8f85] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c47f4e] focus-visible:ring-offset-2 focus-visible:border-[#c47f4e] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-[#c0b9ae]',
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
