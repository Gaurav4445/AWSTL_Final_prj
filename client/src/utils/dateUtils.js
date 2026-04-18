import { format, formatDistanceToNow, isPast, isToday, addDays } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'dd MMM yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'dd MMM yyyy, hh:mm a');
};

export const timeAgo = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const isDue = (date) => {
  if (!date) return false;
  return isPast(new Date(date)) || isToday(new Date(date));
};

export const isDueSoon = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return d <= addDays(new Date(), 7) && !isPast(d);
};

export const getMonthName = (month) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[month - 1] || '';
};