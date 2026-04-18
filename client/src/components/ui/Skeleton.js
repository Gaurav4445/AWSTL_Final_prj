import React from 'react';
import { cn } from '../lib/utils';

const Skeleton = ({ className, ...props }) => (
  <div
    className={cn('animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]', className)}
    {...props}
  />
);

export { Skeleton };
