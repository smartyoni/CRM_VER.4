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

// 전화번호를 입력값에 따라 포맷팅 (010-2019-2463 형식)
export const formatPhoneNumber = (value) => {
    if (!value) return '';

    // 숫자만 추출
    const numbers = value.replace(/\D/g, '');

    // 길이에 따라 포맷팅
    if (numbers.length <= 3) {
        return numbers;
    } else if (numbers.length <= 7) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
};
