export const parseDate = (dateVal: any): Date | null => {
  if (dateVal === undefined || dateVal === null || dateVal === '') return null;
  if (dateVal instanceof Date) {
    return isNaN(dateVal.getTime()) ? null : dateVal;
  }
  
  // Handle Firestore/Firestore-like objects
  if (typeof dateVal === 'object') {
    if (typeof dateVal.toDate === 'function') {
      try {
        const d = dateVal.toDate();
        if (d instanceof Date && !isNaN(d.getTime())) return d;
      } catch (e) {
        // ignore and fallback
      }
    }
    if (typeof dateVal.seconds === 'number') {
      return new Date(dateVal.seconds * 1000);
    }
    if (typeof dateVal._seconds === 'number') {
      return new Date(dateVal._seconds * 1000);
    }
  }

  // Handle number input
  if (typeof dateVal === 'number') {
    if (isNaN(dateVal)) return null;
    // If it's standard Unix seconds (e.g. 1719283739), convert to ms
    if (dateVal > 1000000000 && dateVal < 3000000000) {
      return new Date(dateVal * 1000);
    }
    return new Date(dateVal);
  }

  // Handle string input
  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined' || trimmed === 'NaN') {
      return null;
    }
    // If string is purely numeric, parse as number/timestamp
    if (/^\d+$/.test(trimmed)) {
      const parsedNum = parseInt(trimmed, 10);
      if (parsedNum > 1000000000 && parsedNum < 3000000000) {
        return new Date(parsedNum * 1000);
      }
      return new Date(parsedNum);
    }
    
    // Otherwise parse as standard date string
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d;
    }
  }

  // Fallback check
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d;
    }
  } catch (e) {
    // ignore
  }

  console.warn("Invalid date value encountered in parseDate:", dateVal);
  return null;
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
