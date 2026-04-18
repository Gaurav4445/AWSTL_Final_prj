// src/utils/dateUtils.js
import { format, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
  return format(parsedDate, 'dd MMM yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
  return format(parsedDate, 'dd MMM yyyy HH:mm');
};