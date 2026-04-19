import React from 'react';
import { cn } from '../../lib/utils';

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('text-sm font-600 text-[#1c2b27] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
    {...props}
  />
));
Label.displayName = 'Label';

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      'flex min-h-[90px] w-full rounded-10 border border-[#d8d1c7] bg-white px-4 py-2 text-sm text-[#1c2b27] placeholder:text-[#9b8f85] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c47f4e] focus-visible:ring-offset-2 focus-visible:border-[#c47f4e] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none hover:border-[#c0b9ae]',
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

const Select = React.forwardRef(({ className, ...props }, ref) => (
  <select
    className={cn(
      'flex h-11 w-full rounded-10 border border-[#d8d1c7] bg-white px-4 py-2 text-sm text-[#1c2b27] placeholder:text-[#9b8f85] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c47f4e] focus-visible:ring-offset-2 focus-visible:border-[#c47f4e] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-[#c0b9ae] appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%278%27 viewBox=%270 0 12 8%27%3E%3Cpath fill=%27%23c47f4e%27 d=%27M1 1l5 5 5-5%27/%3E%3C/svg%3E")] bg-no-repeat bg-right-4 pr-10 bg-[length:12px_8px]',
      className
    )}
    ref={ref}
    {...props}
  />
));
Select.displayName = 'Select';

export { Label, Textarea, Select };
