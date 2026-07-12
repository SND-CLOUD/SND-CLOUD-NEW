export const parseDate = (dateVal: any): Date | null => {
  if (!dateVal) return null;
  if (dateVal instanceof Date) return dateVal;
  if (dateVal.toDate && typeof dateVal.toDate === 'function') return dateVal.toDate();
  if (dateVal.seconds) return new Date(dateVal.seconds * 1000);
  
  // Try parsing as number
  const numVal = typeof dateVal === 'string' ? parseFloat(dateVal) : dateVal;
  if (typeof numVal === 'number' && !isNaN(numVal)) return new Date(numVal);

  const d = new Date(dateVal);
  if (isNaN(d.getTime())) {
    console.error("Invalid date value:", dateVal);
    return null;
  }
  return d;
};

export const formatDateTime = (date: Date | null): string => {
  if (!date) return '---';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}/${month}/${day} ${hours}:${minutes}`;
};
