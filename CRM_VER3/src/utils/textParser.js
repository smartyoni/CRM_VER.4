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
 * 원본 포맷과 정리본 포맷 모두 지원
 * @param {string} text - 매물 정보 전체 텍스트
 * @returns {object} - { propertyName, agencyName, contactNumber }
 */
export const parsePropertyDetails = (text) => {
  if (!text) {
    return {
      propertyName: '',
      agencyName: '',
      contactNumber: ''
    };
  }

  const lines = text.split('\n').filter(line => line.trim() !== '');

  // 정리본 포맷 감지 (소재지:, 임대료:, 부동산: 등 라벨이 있는지 확인)
  const isStructuredFormat = lines.some(line => line.includes('소재지:'));

  if (isStructuredFormat) {
    // 정리본 포맷에서 추출
    let propertyName = '';
    let agencyName = '';
    let contactNumber = '';

    for (const line of lines) {
      if (line.includes('소재지:')) {
        // 소재지: 건물명(주소) → 건물명 추출
        const match = line.match(/소재지:\s*(.+?)\(/);
        if (match) {
          propertyName = match[1].trim();
        }
      } else if (line.includes('부동산:')) {
        // 부동산: 부동산명 → 부동산명 추출
        agencyName = line.replace('부동산:', '').trim();
      } else if (line.includes('연락처:')) {
        // 연락처: 전화번호 → 전화번호 추출
        const match = line.match(/연락처:\s*([\d\-]+)/);
        if (match) {
          contactNumber = match[1].trim();
        }
      }
    }

    return {
      propertyName,
      agencyName,
      contactNumber
    };
  } else {
    // 원본 포맷에서 추출 (기존 방식)
    return {
      propertyName: extractPropertyName(text),
      agencyName: extractAgencyName(text),
      contactNumber: extractContactNumber(text)
    };
  }
};

/**
 * 원본 매물정보를 7개 항목으로 정리된 형식으로 변환
 * @param {string} rawText - 원본 매물 정보 텍스트
 * @returns {string} - 정리된 매물정보 (7개 항목)
 */
export const generateStructuredPropertyInfo = (rawText) => {
  if (!rawText) return '';

  // 매물정보 헤더
  let propertyInfo = '🏠 매물정보';

  // 1. 소재지: "물 건  명" + "소 재 지" → 건물명(지번주소)
  let location = '';
  const buildingNameMatch = rawText.match(/물\s*건\s*명\s*(.+?)(?=건축|$)/s);
  const addressMatch = rawText.match(/소\s*재\s*지\s*(.+?)(?=공개여부|대\s*분|$)/);

  if (buildingNameMatch && addressMatch) {
    const buildingName = buildingNameMatch[1].trim().split('\n')[0].trim();
    const address = addressMatch[1].trim().split(/\s+/)[0];
    location = `• 소재지: ${buildingName}(${address})`;
  } else if (buildingNameMatch) {
    const buildingName = buildingNameMatch[1].trim().split('\n')[0].trim();
    location = `• 소재지: ${buildingName}`;
  }

  // 2. 임대료: "매도금액" 또는 "보 증 금" + "월     세" → 보증금/월세
  let rent = '';
  // 먼저 현보증금과 현월세를 찾고, 없으면 보증금과 월세를 찾기
  let depositMatch = rawText.match(/현\s*보\s*증\s*금\s*([0-9,]+)/);
  let monthlyRentMatch = rawText.match(/현\s*월\s*세\s*([0-9,]+)/);

  if (!depositMatch) {
    depositMatch = rawText.match(/보\s*증\s*금\s*([0-9,]+)/);
  }
  if (!monthlyRentMatch) {
    monthlyRentMatch = rawText.match(/월\s*세\s*([0-9,]+)/);
  }

  if (depositMatch && monthlyRentMatch) {
    const deposit = depositMatch[1].trim();
    const monthlyRent = monthlyRentMatch[1].trim();
    rent = `• 임대료: ${deposit}/${monthlyRent}`;
  }

  // 3. 구조정보: 전용면적/방갯수,욕실갯수 → 면적㎡ (약X평)/방X,욕실X
  let structure = '';
  // 전용면적의 모든 숫자를 찾아서 가장 큰 값을 사용 (보통 마지막이 정확한 전용면적)
  const allAreasMatch = rawText.match(/전용면적[\s(]*([0-9.]+)[\s)]*[\s]*([0-9.]*)/);
  let area = '';
  if (allAreasMatch) {
    // 두 번째 값이 있으면 사용, 없으면 첫 번째 값 사용
    area = allAreasMatch[2] ? allAreasMatch[2].trim() : allAreasMatch[1].trim();
  }

  const roomMatch = rawText.match(/방\s*수\s*(\d+)/);
  const bathMatch = rawText.match(/욕\s*실\s*수\s*(\d+)/);

  if (area) {
    const rooms = roomMatch ? roomMatch[1].trim() : '0';
    const baths = bathMatch ? bathMatch[1].trim() : '0';
    // 제곱미터를 평으로 환산 (1평 = 3.3058 m²)
    const pyeong = Math.round(parseFloat(area) / 3.3058);
    structure = `• 구조정보: ${area}㎡ (약${pyeong}평)/방${rooms},욕실${baths}`;
  }

  // 4. 동/층 정보: "동 [X/X]" 또는 "동 [X]" → X동/Y층
  let floorInfo = '';
  // 패턴 1: 1동 [1/10]
  let floorMatch = rawText.match(/(\d+)동\s*\[(\d+)\s*\/\s*(\d+)\]/);
  if (floorMatch) {
    const building = floorMatch[1];
    const floor = floorMatch[2];
    floorInfo = `• 동/층: ${building}동/${floor}층`;
  } else {
    // 패턴 2: 1동 [고] 같은 경우 (숫자가 아닌 경우)
    floorMatch = rawText.match(/(\d+)동\s*\[([^\]]+)\]/);
    if (floorMatch) {
      const building = floorMatch[1];
      const floor = floorMatch[2].trim();
      floorInfo = `• 동/층: ${building}동/${floor}`;
    }
  }

  // 5. 특징: 공개비고의 내용
  let feature = '';
  const featureMatch = rawText.match(/공개비고\s*(.+?)(?=매물메모|비고|복도구조|$)/s);

  if (featureMatch) {
    const desc = featureMatch[1].trim().replace(/\s+/g, ' ');
    if (desc) {
      feature = `• 특징: ${desc}`;
    }
  }

  // 6. 부동산명: 공인중개사 정보에서 추출
  let agency = '';
  const agencyMatch = rawText.match(/(.+?공인중개사.*?사무소)/);

  if (agencyMatch) {
    agency = `• 부동산: ${agencyMatch[1].trim()}`;
  }

  // 7. 연락처: 핸드폰번호 또는 070번호
  let contact = '';
  const phoneMatch = rawText.match(/핸드폰번호\s*(0\d{1,2}-\d{3,4}-\d{4}|0\d{10,11})/);
  const emergencyMatch = rawText.match(/070\s*번호\s*(070-\d{4}-\d{4}|070\d{8})/);

  if (phoneMatch) {
    contact = `• 연락처: ${phoneMatch[1].trim()}`;
  } else if (emergencyMatch) {
    contact = `• 연락처: ${emergencyMatch[1].trim()}`;
  }

  // 모든 항목 결합
  const result = [propertyInfo, location, rent, structure, floorInfo, feature, agency, contact]
    .filter(item => item !== '')
    .join('\n');

  return result;
};
