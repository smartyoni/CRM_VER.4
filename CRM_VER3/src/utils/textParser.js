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
 * 공인중개사사무소 또는 중개법인 뒤의 연락처(전화번호만) 추출
 * 유선번호(02-) 우선, 없으면 핸드폰번호
 * @param {string} text - 매물 정보 전체 텍스트
 * @returns {string} - 추출된 전화번호
 */
export const extractContactNumber = (text) => {
  if (!text) return '';

  const lines = text.split('\n').filter(line => line.trim() !== '');

  // 전화번호 추출 헬퍼 함수
  const extractPhoneFromLine = (line) => {
    // 관리소전화는 제외
    if (line.match(/관리소|관리팀|관리사무소/i)) {
      return null;
    }

    // "팩 스", "팩스", "fax", "FAX" 라벨이 바로 앞에 있으면 제외
    if (line.match(/(팩\s*스|팩스|fax|FAX)\s*[\d\-]/i)) {
      return null;
    }

    // 1. "전 화 번 호" 또는 "전화번호" 라벨 뒤의 02- 번호 (띄어쓰기 허용)
    const labeledSeoulPattern = /(전\s*화\s*번\s*호|전화번호)\s*(02[-\s]?\d{3,4}[-\s]?\d{4})/;
    const labeledSeoulMatch = line.match(labeledSeoulPattern);
    if (labeledSeoulMatch) {
      return labeledSeoulMatch[2].replace(/\s/g, '').trim();
    }

    // 2. 02- 번호 최우선 (라벨 없음)
    const seoulPattern = /(02[-\s]?\d{3,4}[-\s]?\d{4})/;
    const seoulMatch = line.match(seoulPattern);
    if (seoulMatch) {
      return seoulMatch[1].replace(/\s/g, '').trim();
    }

    // 3. "핸드폰번호" 라벨 뒤의 01x-xxxx-xxxx
    const labeledPhonePattern = /(핸드폰\s*번호|휴대폰\s*번호)\s*(01[0-9][-\s]?\d{3,4}[-\s]?\d{4})/;
    const labeledPhoneMatch = line.match(labeledPhonePattern);
    if (labeledPhoneMatch) {
      return labeledPhoneMatch[2].replace(/\s/g, '').trim();
    }

    // 4. 핸드폰번호: 01x-xxxx-xxxx (라벨 없음)
    const phonePattern = /(01[0-9][-\s]?\d{3,4}[-\s]?\d{4})/;
    const phoneMatch = line.match(phonePattern);
    if (phoneMatch) {
      return phoneMatch[1].replace(/\s/g, '').trim();
    }

    // 5. 일반 전화번호 패턴 매칭
    const generalPattern = /(\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4})/;
    const generalMatch = line.match(generalPattern);
    if (generalMatch) {
      return generalMatch[1].replace(/\s/g, '').trim();
    }

    return null;
  };

  // 공인중개사사무소 또는 중개법인을 찾기
  let agencyLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/공인중개사.*사무소|중개법인/)) {
      agencyLineIndex = i;
      break;
    }
  }

  // 1. 공인중개사사무소/중개법인 라인 자체에서 확인
  if (agencyLineIndex >= 0) {
    const phone = extractPhoneFromLine(lines[agencyLineIndex]);
    if (phone) {
      return phone;
    }
  }

  // 2. 공인중개사사무소/중개법인 뒤의 라인들을 확인
  if (agencyLineIndex >= 0 && agencyLineIndex < lines.length - 1) {
    // 다음 10개 라인까지 확인
    for (let i = agencyLineIndex + 1; i < Math.min(agencyLineIndex + 10, lines.length); i++) {
      const phone = extractPhoneFromLine(lines[i]);
      if (phone) {
        return phone;
      }
    }
  }

  // 3. 공인중개사를 찾지 못했다면 마지막 라인에서 확인
  if (agencyLineIndex < 0 && lines.length > 0) {
    const phone = extractPhoneFromLine(lines[lines.length - 1]);
    if (phone) {
      return phone;
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
      } else if (line.includes('연락처:') && !line.match(/\b(팩스|fax|FAX|관리소|관리팀|관리사무소)\b/i)) {
        // 연락처: 전화번호 → 전화번호 추출 (팩스, 관리소전화는 제외)
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
 * 형식 감지: 네이버 부동산 형식 여부 판단
 * @param {string} text - 매물 정보 텍스트
 * @returns {boolean} - 네이버 형식 여부
 */
const detectNaverFormat = (text) => {
  return text.includes('계약/전용면적') ||
         text.includes('해당층/총층') ||
         text.includes('매물특징');
};

/**
 * 네이버 부동산 형식 파싱
 * @param {string} rawText - 네이버 형식 매물정보
 * @returns {string} - 정리된 매물정보 (7개 항목)
 */
const parseNaverFormat = (rawText) => {
  let propertyInfo = '🏠 매물정보';

  // 1. 소재지: 제목(첫 줄)에서 건물명만 추출
  let location = '';
  const lines = rawText.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    // 첫 줄에서 숫자동, 층수 정보 제거
    const titleLine = lines[0].trim();
    const buildingName = titleLine.replace(/\s*\d+동\s*(저층|고층|중층)?.*$/, '').trim();
    if (buildingName) {
      location = `• 소재지: ${buildingName}`;
    }
  }

  // 2. 임대료: "월세X억 X,XXX/X" → 보증금/월세
  let rent = '';
  const naverRentMatch = rawText.match(/월세(\d+)억\s*([0-9,]+)\/(\d+)/);
  if (naverRentMatch) {
    const eok = naverRentMatch[1];
    const man = naverRentMatch[2];
    const monthlyRent = naverRentMatch[3];
    // 억을 만 단위로 변환
    const depositMoney = parseInt(eok) * 10000 + parseInt(man.replace(/,/g, ''));
    rent = `• 임대료: ${depositMoney}/${monthlyRent}`;
  }

  // 3. 구조정보: "계약/전용면적" + "방수/욕실수" → 전용면적㎡ (약X평)/방X,욕실X
  let structure = '';
  // 계약면적과 전용면적 모두 추출 (전용면적이 더 작은 값)
  const naverAreaMatch = rawText.match(/계약\/전용면적\s*([\d.]+)㎡\/([\d.]+)㎡/);
  const naverRoomMatch = rawText.match(/방수\/욕실수\s*(\d+)\/(\d+)/);

  if (naverAreaMatch && naverRoomMatch) {
    const area1 = parseFloat(naverAreaMatch[1]);
    const area2 = parseFloat(naverAreaMatch[2]);
    // 작은 면적을 전용면적으로 선택
    const area = Math.min(area1, area2).toString();
    const rooms = naverRoomMatch[1];
    const baths = naverRoomMatch[2];
    const pyeong = Math.round(parseFloat(area) / 3.3058);
    structure = `• 구조정보: ${area}㎡ (약${pyeong}평)/방${rooms},욕실${baths}`;
  }

  // 4. 동/층: 제목에서 "동" + "해당층/총층"에서 층 정보
  let floorInfo = '';
  const dongMatch = lines[0]?.match(/(\d+)동/);
  const naverFloorMatch = rawText.match(/해당층\/총층\s*([^/]+)\/(\d+)층/);

  if (dongMatch && naverFloorMatch) {
    const dong = dongMatch[1];
    const floor = naverFloorMatch[1].trim();
    floorInfo = `• 동/층: ${dong}동/${floor}`;
  }

  // 5. 특징: "매물특징" 뒤의 내용
  let feature = '';
  const naverFeatureMatch = rawText.match(/매물특징\s*(.+?)(?=계약\/전용면적|해당층|$)/);
  if (naverFeatureMatch) {
    const featureText = naverFeatureMatch[1].trim();
    if (featureText) {
      feature = `• 특징: ${featureText}`;
    }
  }

  // 6. 부동산: "중개사" 또는 "중개법인" 뒤의 이름
  let agency = '';
  // 공인중개사 패턴 또는 중개법인 패턴
  let naverAgencyMatch = rawText.match(/중개사\s*(.+?공인중개사사무소)/);

  if (!naverAgencyMatch) {
    // 중개법인 패턴
    naverAgencyMatch = rawText.match(/중개[사법인]*\s*(.+?중개법인)/);
  }

  if (naverAgencyMatch) {
    agency = `• 부동산: ${naverAgencyMatch[1].trim()}`;
  }

  // 7. 연락처: 공인중개사사무소/중개법인 뒤의 전화번호 (관리소전화, 팩스 제외)
  let contact = '';
  const naverContactNumber = extractContactNumber(rawText);
  if (naverContactNumber) {
    contact = `• 연락처: ${naverContactNumber}`;
  }

  // 모든 항목 결합
  const result = [propertyInfo, location, rent, structure, floorInfo, feature, agency, contact]
    .filter(item => item !== '')
    .join('\n');

  return result;
};

/**
 * 기존 형식 (매물번호 형식) 파싱
 * @param {string} rawText - 기존 형식 매물정보
 * @returns {string} - 정리된 매물정보 (7개 항목)
 */
const parseOriginalFormat = (rawText) => {
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
  // 전용면적이 2개일 때 작은 값을 전용면적으로 선택
  const allAreasMatch = rawText.match(/전용면적[\s(]*([0-9.]+)[\s)]*[\s]*([0-9.]*)/);
  let area = '';
  if (allAreasMatch) {
    const area1 = parseFloat(allAreasMatch[1]);
    // 두 번째 값이 있으면 두 값 중 작은 값 선택, 없으면 첫 번째 값 사용
    if (allAreasMatch[2] && allAreasMatch[2].trim()) {
      const area2 = parseFloat(allAreasMatch[2].trim());
      area = Math.min(area1, area2).toString();
    } else {
      area = area1.toString();
    }
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

  // 6. 부동산명: 공인중개사 또는 중개법인 정보에서 추출
  let agency = '';
  // 공인중개사 패턴 또는 중개법인 패턴
  let agencyMatch = rawText.match(/(.+?공인중개사.*?사무소)/);

  if (!agencyMatch) {
    // 중개법인 패턴
    agencyMatch = rawText.match(/(.+?중개법인)/);
  }

  if (agencyMatch) {
    agency = `• 부동산: ${agencyMatch[1].trim()}`;
  }

  // 7. 연락처: 공인중개사사무소/중개법인 뒤의 전화번호 (관리소전화, 팩스 제외)
  let contact = '';
  const contactNumber = extractContactNumber(rawText);
  if (contactNumber) {
    contact = `• 연락처: ${contactNumber}`;
  }

  // 모든 항목 결합
  const result = [propertyInfo, location, rent, structure, floorInfo, feature, agency, contact]
    .filter(item => item !== '')
    .join('\n');

  return result;
};

/**
 * 원본 매물정보를 7개 항목으로 정리된 형식으로 변환
 * 자동으로 형식을 감지하여 적절한 파싱 함수 호출
 * @param {string} rawText - 원본 매물 정보 텍스트
 * @returns {string} - 정리된 매물정보 (7개 항목)
 */
export const generateStructuredPropertyInfo = (rawText) => {
  if (!rawText) return '';

  // 형식 자동 감지
  if (detectNaverFormat(rawText)) {
    return parseNaverFormat(rawText);
  } else {
    return parseOriginalFormat(rawText);
  }
};
