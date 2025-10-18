export const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

export const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    // Format to YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', isoString, error);
    return '';
  }
};

export const formatDateTime = (isoString) => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        return date.toLocaleString('ko-KR', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    } catch (error) {
        console.error('Error formatting date-time:', isoString, error);
        return '';
    }
};
