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

// 금액을 한글로 변환 (10000000 -> 1천만원)
export const formatAmountToKorean = (value) => {
    if (!value || value === '' || value === '0') return '';

    const amount = parseInt(value.toString().replace(/\D/g, ''));
    if (isNaN(amount)) return '';

    const units = [
        { value: 1000000000, label: '십억' },
        { value: 100000000, label: '억' },
        { value: 10000000, label: '천만' },
        { value: 1000000, label: '백만' },
        { value: 100000, label: '십만' },
        { value: 10000, label: '만' }
    ];

    for (let unit of units) {
        if (amount >= unit.value) {
            const quotient = Math.floor(amount / unit.value);
            const remainder = amount % unit.value;

            if (remainder === 0) {
                return `${quotient}${unit.label}원`;
            } else {
                // 나머지가 있는 경우 처리
                const nextUnit = units.find(u => u.value === Math.floor(remainder / (unit.value / 10)));
                if (nextUnit) {
                    const remainderQuotient = Math.floor(remainder / (unit.value / 10));
                    return `${quotient}${unit.label} ${remainderQuotient}${nextUnit.label}원`;
                }
                return `${quotient}${unit.label}원`;
            }
        }
    }

    return `${amount}원`;
};
