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

// 금액을 한글로 변환 (560000 -> 56만원, 505000 -> 50만 5천원)
export const formatAmountToKorean = (value) => {
    if (!value || value === '' || value === '0') return '';

    const amount = parseInt(value.toString().replace(/\D/g, ''));
    if (isNaN(amount)) return '';

    // 가장 적절한 단위 찾기
    if (amount >= 1000000000) {
        const quotient = Math.floor(amount / 1000000000);
        const remainder = amount % 1000000000;
        if (remainder === 0) return `${quotient}십억원`;
        const subQuotient = Math.floor(remainder / 100000000);
        if (subQuotient > 0) return `${quotient}십억 ${subQuotient}억원`;
        return `${quotient}십억원`;
    } else if (amount >= 100000000) {
        const quotient = Math.floor(amount / 100000000);
        const remainder = amount % 100000000;
        if (remainder === 0) return `${quotient}억원`;
        const subQuotient = Math.floor(remainder / 10000000);
        if (subQuotient > 0) return `${quotient}억 ${subQuotient}천만원`;
        return `${quotient}억원`;
    } else if (amount >= 10000000) {
        const quotient = Math.floor(amount / 10000000);
        const remainder = amount % 10000000;
        if (remainder === 0) return `${quotient}천만원`;
        const subQuotient = Math.floor(remainder / 1000000);
        if (subQuotient > 0) return `${quotient}천만 ${subQuotient}백만원`;
        return `${quotient}천만원`;
    } else if (amount >= 1000000) {
        const quotient = Math.floor(amount / 1000000);
        const remainder = amount % 1000000;
        if (remainder === 0) return `${quotient}백만원`;
        const subQuotient = Math.floor(remainder / 100000);
        if (subQuotient > 0) return `${quotient}백만 ${subQuotient}십만원`;
        return `${quotient}백만원`;
    } else if (amount >= 100000) {
        const quotient = Math.floor(amount / 100000);
        const remainder = amount % 100000;
        if (remainder === 0) return `${quotient}십만원`;
        // 만 단위, 천 단위 처리
        const manUnits = Math.floor(remainder / 10000);
        const thousandRemainder = remainder % 10000;
        const thousandUnits = Math.floor(thousandRemainder / 1000);

        if (manUnits > 0 && thousandUnits > 0) {
            return `${quotient}십만 ${manUnits}만 ${thousandUnits}천원`;
        } else if (manUnits > 0) {
            return `${quotient}십만 ${manUnits}만원`;
        } else if (thousandUnits > 0) {
            return `${quotient}십만 ${thousandUnits}천원`;
        }
        return `${quotient}십만원`;
    } else if (amount >= 10000) {
        const quotient = Math.floor(amount / 10000);
        const remainder = amount % 10000;
        if (remainder === 0) return `${quotient}만원`;
        const subQuotient = Math.floor(remainder / 1000);
        if (subQuotient > 0) return `${quotient}만 ${subQuotient}천원`;
        return `${quotient}만원`;
    } else if (amount >= 1000) {
        return `${Math.floor(amount / 1000)}천원`;
    } else {
        return `${amount}원`;
    }
};
