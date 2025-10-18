// 매물 정보 텍스트에서 건물호실명과 연락처를 자동으로 추출하는 함수

/**
 * 매물 정보 텍스트의 2번째 줄에서 건물호실명 추출
 * @param {string} text - 매물 정보 전체 텍스트
 * @returns {string} - 추출된 건물호실명
 */
export const extractPropertyName = (text) => {
  if (!text) return '';

  const lines = text.split('\n').filter(line => line.trim() !== '');

  // 2번째 줄 반환 (인덱스 1)
  if (lines.length >= 2) {
    return lines[1].trim();
  }

  return '';
};

/**
 * 매물 정보 텍스트의 7번째 줄에서 부동산 이름 추출
 * @param {string} text - 매물 정보 전체 텍스트
 * @returns {string} - 추출된 부동산 이름
 */
export const extractAgencyName = (text) => {
  if (!text) return '';

  const lines = text.split('\n').filter(line => line.trim() !== '');

  // 7번째 줄 반환 (인덱스 6)
  if (lines.length >= 7) {
    return lines[6].trim();
  }

  return '';
};

/**
 * 매물 정보 텍스트의 마지막 줄에서 연락처(전화번호만) 추출
 * @param {string} text - 매물 정보 전체 텍스트
 * @returns {string} - 추출된 전화번호
 */
export const extractContactNumber = (text) => {
  if (!text) return '';

  const lines = text.split('\n').filter(line => line.trim() !== '');

  // 마지막 줄에서 전화번호 패턴 추출
  if (lines.length > 0) {
    const lastLine = lines[lines.length - 1].trim();

    // 전화번호 패턴 매칭 (010-1234-5678, 01012345678, 02-123-4567 등)
    // 숫자와 하이픈으로 이루어진 10~13자리 패턴 찾기
    const phonePattern = /(\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4})/;
    const match = lastLine.match(phonePattern);

    if (match) {
      return match[0].trim();
    }

    // 패턴이 없으면 숫자와 하이픈만 추출
    const numbersOnly = lastLine.replace(/[^\d-]/g, '');
    if (numbersOnly.length >= 9) {
      return numbersOnly;
    }
  }

  return '';
};

/**
 * 매물 정보 텍스트 붙여넣기 시 자동으로 건물명, 부동산, 연락처 추출
 * @param {string} text - 매물 정보 전체 텍스트
 * @returns {object} - { propertyName, agencyName, contactNumber }
 */
export const parsePropertyDetails = (text) => {
  return {
    propertyName: extractPropertyName(text),
    agencyName: extractAgencyName(text),
    contactNumber: extractContactNumber(text)
  };
};
