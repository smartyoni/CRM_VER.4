// 매물 정보 텍스트에서 건물호실명과 연락처를 자동으로 추출하는 함수

/**
 * 매물 정보 텍스트에서 호실명 추출
 * "오피스텔", "건물,위치", "건물", "위치" 라벨 다음의 내용으로 추출
 * @param {string} text - 매물 정보 전체 텍스트
 * @returns {string} - 추출된 건물호실명
 */
export const extractPropertyName = (text) => {
  if (!text) return '';

  const lines = text.split('\n');

  // 여러 라벨을 찾기 (우선순위: 오피스텔 > 건물,위치 > 건물 > 위치)
  const labels = [
    /오피스텔/,
    /건물,?\s*위치/,
    /^건\s*물$/,
    /^위\s*치$/
  ];

  for (const labelPattern of labels) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.match(labelPattern)) {
        // 같은 라인에서 라벨 뒤의 내용 추출
        // 패턴: "라벨    값" 또는 "라벨값" 형태
        const match = line.match(labelPattern.source + /\s+(.+?)(?:\s{2,}|동\s*\[|주\s*택|$)/.source);
        if (match && match[1]) {
          return match[1].trim();
        }

        // 같은 라인에서 못 찾으면 다음 라인에서 찾기
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (nextLine && !nextLine.match(/^(주\s*소|주\s+택|연\s+면|분\s+양|동\s*\[|층|보\s+증)/)) {
            return nextLine;
          }
        }
      }
    }
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
 * 공인중개사사무소 또는 중개법인 뒤의 "전 화 번 호" 또는 "전화번호" 라벨에서 연락처 추출 (TEN 양식)
 * @param {string} text - 매물 정보 전체 텍스트
 * @returns {string} - 추출된 전화번호
 */
export const extractContactNumber = (text) => {
  if (!text) return '';

  const lines = text.split('\n');

  // 공인중개사사무소 또는 중개법인을 찾기
  let agencyLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/공인중개사.*사무소|중개법인/)) {
      agencyLineIndex = i;
      break;
    }
  }

  // 공인중개사사무소/중개법인 뒤의 라인들을 확인
  if (agencyLineIndex >= 0 && agencyLineIndex < lines.length - 1) {
    // 다음 10개 라인까지 확인하여 "전 화 번 호" 또는 "전화번호" 라벨 찾기
    for (let i = agencyLineIndex + 1; i < Math.min(agencyLineIndex + 10, lines.length); i++) {
      const line = lines[i];

      // 관리소전화는 제외
      if (line.match(/관리소|관리팀|관리사무소/i)) {
        continue;
      }

      // "전 화 번 호" (띄어쓰기 포함) 또는 "전화번호" 라벨 찾기
      const phonePattern = /(전\s*화\s*번\s*호|전화번호)\s*([\d\-]+)/;
      const match = line.match(phonePattern);

      if (match) {
        const phoneNumber = match[2].trim();
        // 여러 번호가 쉼표로 구분된 경우 첫 번째만 추출
        const firstPhone = phoneNumber.split(',')[0].trim();
        return firstPhone;
      }
    }
  }

  return '';
};

/**
 * 네이버 부동산에서 호실명 추출 (1번째 줄)
 * @param {string} text - 매물 정보 전체 텍스트
 * @returns {string} - 추출된 호실명
 */
export const extractPropertyNameNaver = (text) => {
  if (!text) return '';

  const lines = text.split('\n').filter(line => line.trim() !== '');

  // 1번째 줄 반환 (인덱스 0)
  if (lines.length > 0) {
    return lines[0].trim();
  }

  return '';
};

/**
 * 네이버 부동산에서 부동산명 추출 (중개사 섹션의 첫 줄)
 * @param {string} text - 매물 정보 전체 텍스트
 * @returns {string} - 추출된 부동산명
 */
export const extractAgencyNameNaver = (text) => {
  if (!text) return '';

  const lines = text.split('\n');

  // "중개사" 라벨을 찾고 다음 라인에서 부동산명 추출
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('중개사') && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      if (nextLine && !nextLine.includes('대표') && !nextLine.includes('등록')) {
        return nextLine;
      }
    }
  }

  return '';
};

/**
 * 네이버 부동산에서 연락처 추출 ("전화" 라벨 바로 뒤의 번호)
 * 우선순위: 02- (서울) > 기타 지역번호 > 핸드폰
 * @param {string} text - 매물 정보 전체 텍스트
 * @returns {string} - 추출된 전화번호
 */
export const extractContactNumberNaver = (text) => {
  if (!text) return '';

  // "전화" 라벨 바로 뒤의 번호 패턴 매칭
  const phoneLinePattern = /전화([\d\-,\s]+)(?:최근|$)/;
  const match = text.match(phoneLinePattern);

  if (match) {
    const phoneNumbers = match[1].trim();

    // 1순위: 02- (서울 유선)
    const seoulMatch = phoneNumbers.match(/(02[-\s]?\d{3,4}[-\s]?\d{4})/);
    if (seoulMatch) {
      return seoulMatch[1].replace(/\s/g, '');
    }

    // 2순위: 기타 지역번호 (0xx-)
    const landlineMatch = phoneNumbers.match(/(\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4})/);
    if (landlineMatch) {
      return landlineMatch[1].replace(/\s/g, '');
    }

    // 3순위: 핸드폰 (010-)
    const mobileMatch = phoneNumbers.match(/(010[-\s]?\d{4}[-\s]?\d{4})/);
    if (mobileMatch) {
      return mobileMatch[1].replace(/\s/g, '');
    }
  }

  return '';
};

/**
 * 매물 정보 텍스트 붙여넣기 시 자동으로 건물명, 부동산, 연락처 추출
 * 원본 포맷과 정리본 포맷 모두 지원
 * @param {string} text - 매물 정보 전체 텍스트
 * @param {string} source - 매물 소스 ('TEN' 또는 '네이버부동산')
 * @returns {object} - { propertyName, agencyName, contactNumber }
 */
export const parsePropertyDetails = (text, source = 'TEN') => {
  if (!text) {
    return {
      propertyName: '',
      agencyName: '',
      contactNumber: ''
    };
  }

  const lines = text.split('\n').filter(line => line.trim() !== '');

  // 정리본 포맷 감지 (소재지:, 임대료:, 부동산: 등 라벨이 있는지 확인)
  // ⭐ 정리본 형식을 최우선으로 감지
  const isStructuredFormat = lines.some(line => line.includes('소재지:')) ||
                            lines.some(line => line.includes('• 소재지:'));

  if (isStructuredFormat) {
    // 정리본 포맷에서 추출
    let propertyName = '';
    let agencyName = '';
    let contactNumber = '';

    for (const line of lines) {
      if (line.includes('소재지:')) {
        // 소재지: 건물명(주소) → 건물명 추출
        // "• 소재지:" 형식도 처리
        const match = line.match(/소재지:\s*(.+?)\(/);
        if (match) {
          propertyName = match[1].trim();
        }
      } else if (line.includes('부동산:')) {
        // 부동산: 부동산명 → 부동산명 추출
        // "• 부동산:" 형식도 처리
        agencyName = line.replace('•', '').replace('부동산:', '').trim();
      } else if (line.includes('연락처:') && !line.match(/\b(팩스|fax|FAX|관리소|관리팀|관리사무소)\b/i)) {
        // 연락처: 전화번호 → 전화번호 추출 (팩스, 관리소전화는 제외)
        // "• 연락처:" 형식도 처리
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
  } else if (source === '네이버부동산') {
    // 네이버부동산 포맷에서 추출
    return {
      propertyName: extractPropertyNameNaver(text),
      agencyName: extractAgencyNameNaver(text),
      contactNumber: extractContactNumberNaver(text)
    };
  } else {
    // TEN 원본 포맷에서 추출 (기존 방식)
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
  let location = '정보없음';
  const lines = rawText.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    // 첫 줄에서 숫자동, 층수 정보 제거
    const titleLine = lines[0].trim();
    const buildingName = titleLine.replace(/\s*\d+동\s*(저층|고층|중층)?.*$/, '').trim();
    if (buildingName) {
      location = buildingName;
    }
  }

  // 2. 임대료: "전세/월세/매매" 라인에서 금액 추출 (보증금/월세 형식)
  let rent = '정보없음';
  // "월세XX/XX" 또는 "전세XX" 또는 "매매XX" 형식 찾기
  const rentLineMatch = rawText.match(/(월세|전세|매매)(\d+)\/(\d+)|월세(\d+)/);
  if (rentLineMatch) {
    if (rentLineMatch[1] === '월세' && rentLineMatch[2] && rentLineMatch[3]) {
      // 월세XX/XX 형식
      const deposit = rentLineMatch[2];
      const monthlyRent = rentLineMatch[3];
      rent = `${deposit}/${monthlyRent}`;
    } else if (rentLineMatch[1] === '전세' && rentLineMatch[2]) {
      // 전세XX 형식
      rent = rentLineMatch[2];
    } else if (rentLineMatch[1] === '매매' && rentLineMatch[2]) {
      // 매매XX 형식
      rent = rentLineMatch[2];
    }
  }

  // 3. 구조정보: "계약/전용면적" + "방수/욕실수" → 전용면적㎡ (약X평)/방X,욕실X
  let structure = '정보없음';
  // 계약면적과 전용면적 모두 추출 (전용면적이 더 작은 값)
  const naverAreaMatch = rawText.match(/계약\/전용면적\s*([\d.]+)㎡\/([\d.]+)㎡/);
  const naverRoomMatch = rawText.match(/방수\/욕실수\s*(\d+)\/(\d+)/);

  if (naverAreaMatch && naverRoomMatch) {
    const area1 = parseFloat(naverAreaMatch[1]);
    const area2 = parseFloat(naverAreaMatch[2]);
    // 작은 면적을 전용면적으로 선택
    const area = Math.min(area1, area2);
    const rooms = naverRoomMatch[1];
    const baths = naverRoomMatch[2];
    // 제곱미터를 평으로 환산 (1평 = 3.3, 소수점 첫째자리까지)
    const pyeong = (area / 3.3).toFixed(1);
    structure = `${area}㎡ (전용${pyeong}평)/방${rooms},욕실${baths}`;
  }

  // 4. 동/층: 제목에서 "동" + "해당층/총층"에서 층 정보
  let floorInfo = '정보없음';
  const dongMatch = lines[0]?.match(/(\d+)동/);
  const naverFloorMatch = rawText.match(/해당층\/총층\s*([^/]+)\/(\d+)층/);

  if (dongMatch && naverFloorMatch) {
    const dong = dongMatch[1];
    const floor = naverFloorMatch[1].trim();
    floorInfo = `${dong}동/${floor}`;
  }

  // 5. 특징: "매물특징" + "방향" + "입주가능일" 정보 조합
  let feature = '정보없음';
  let featureParts = [];

  // 매물특징 추출
  const naverFeatureMatch = rawText.match(/매물특징\s*(.+?)(?=계약\/전용면적|해당층|방향|$)/);
  if (naverFeatureMatch) {
    const featureText = naverFeatureMatch[1].trim();
    if (featureText) {
      featureParts.push(featureText);
    }
  }

  // 방향 추출
  const directionMatch = rawText.match(/방향\s*(.+?)(?=난방|$)/);
  if (directionMatch) {
    const directionText = directionMatch[1].trim();
    if (directionText) {
      featureParts.push(directionText);
    }
  }

  // 입주가능일 추출
  const moveInMatch = rawText.match(/입주가능일\s*(.+?)(?=총주차|$)/);
  if (moveInMatch) {
    const moveInText = moveInMatch[1].trim();
    if (moveInText) {
      featureParts.push(moveInText);
    }
  }

  if (featureParts.length > 0) {
    feature = featureParts.join(' | ');
  }

  // 6. 부동산: "중개사" 또는 "중개법인" 뒤의 이름
  let agency = '정보없음';
  // 공인중개사 패턴 또는 중개법인 패턴
  let naverAgencyMatch = rawText.match(/중개사\s*(.+?공인중개사사무소)/);

  if (!naverAgencyMatch) {
    // 중개법인 패턴
    naverAgencyMatch = rawText.match(/중개[사법인]*\s*(.+?중개법인)/);
  }

  if (naverAgencyMatch) {
    agency = naverAgencyMatch[1].trim();
  }

  // 7. 연락처: 공인중개사사무소/중개법인 뒤의 전화번호 (관리소전화, 팩스 제외)
  let contact = '정보없음';
  const naverContactNumber = extractContactNumber(rawText);
  if (naverContactNumber) {
    contact = naverContactNumber;
  }

  // 모든 항목 결합 (빈 항목도 포함)
  const result = [
    propertyInfo,
    `• 소재지: ${location}`,
    `• 임대료: ${rent}`,
    `• 구조정보: ${structure}`,
    `• 동/층: ${floorInfo}`,
    `• 특징: ${feature}`,
    `• 부동산: ${agency}`,
    `• 연락처: ${contact}`
  ].join('\n');

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
  let location = '정보없음';
  const buildingNameMatch = rawText.match(/물\s*건\s*명\s*(.+?)(?=건축|$)/s);
  const addressMatch = rawText.match(/소\s*재\s*지\s*(.+?)(?=공개여부|대\s*분|$)/);

  if (buildingNameMatch && addressMatch) {
    const buildingName = buildingNameMatch[1].trim().split('\n')[0].trim();
    const address = addressMatch[1].trim().split(/\s+/)[0];
    location = `${buildingName}(${address})`;
  } else if (buildingNameMatch) {
    const buildingName = buildingNameMatch[1].trim().split('\n')[0].trim();
    location = `${buildingName}`;
  }

  // 2. 임대료: "매도금액" 또는 "보 증 금" + "월     세" → 보증금/월세
  let rent = '정보없음';
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
    rent = `${deposit}/${monthlyRent}`;
  }

  // 3. 구조정보: 전용면적/방갯수,욕실갯수 → 면적㎡ (전용X.X평)/방X,욕실X
  let structure = '정보없음';
  // 전용면적이 2개일 때 작은 값을 전용면적으로 선택
  const allAreasMatch = rawText.match(/전용면적[\s(]*([0-9.]+)[\s)]*[\s]*([0-9.]*)/);
  let area = null;
  if (allAreasMatch) {
    const area1 = parseFloat(allAreasMatch[1]);
    // 두 번째 값이 있으면 두 값 중 작은 값 선택, 없으면 첫 번째 값 사용
    if (allAreasMatch[2] && allAreasMatch[2].trim()) {
      const area2 = parseFloat(allAreasMatch[2].trim());
      area = Math.min(area1, area2);
    } else {
      area = area1;
    }
  }

  const roomMatch = rawText.match(/방\s*수\s*(\d+)/);
  const bathMatch = rawText.match(/욕\s*실\s*수\s*(\d+)/);

  if (area !== null) {
    const rooms = roomMatch ? roomMatch[1].trim() : '0';
    const baths = bathMatch ? bathMatch[1].trim() : '0';
    // 제곱미터를 평으로 환산 (1평 = 3.3, 소수점 첫째자리까지)
    const pyeong = (area / 3.3).toFixed(1);
    structure = `${area}㎡ (전용${pyeong}평)/방${rooms},욕실${baths}`;
  }

  // 4. 동/층 정보: "동 [X/X]" 또는 "동 [X]" → X동/Y층
  let floorInfo = '정보없음';
  // 패턴 1: 1동 [1/10]
  let floorMatch = rawText.match(/(\d+)동\s*\[(\d+)\s*\/\s*(\d+)\]/);
  if (floorMatch) {
    const building = floorMatch[1];
    const floor = floorMatch[2];
    floorInfo = `${building}동/${floor}층`;
  } else {
    // 패턴 2: 1동 [고] 같은 경우 (숫자가 아닌 경우)
    floorMatch = rawText.match(/(\d+)동\s*\[([^\]]+)\]/);
    if (floorMatch) {
      const building = floorMatch[1];
      const floor = floorMatch[2].trim();
      floorInfo = `${building}동/${floor}`;
    }
  }

  // 5. 특징: 공개비고의 내용
  let feature = '정보없음';
  const featureMatch = rawText.match(/공개비고\s*(.+?)(?=매물메모|비고|복도구조|$)/s);

  if (featureMatch) {
    const desc = featureMatch[1].trim().replace(/\s+/g, ' ');
    if (desc) {
      feature = `${desc}`;
    }
  }

  // 6. 부동산명: 공인중개사 또는 중개법인 정보에서 추출
  let agency = '정보없음';
  // 공인중개사 패턴 또는 중개법인 패턴
  let agencyMatch = rawText.match(/(.+?공인중개사.*?사무소)/);

  if (!agencyMatch) {
    // 중개법인 패턴
    agencyMatch = rawText.match(/(.+?중개법인)/);
  }

  if (agencyMatch) {
    agency = `${agencyMatch[1].trim()}`;
  }

  // 7. 연락처: 공인중개사사무소/중개법인 뒤의 전화번호 (관리소전화, 팩스 제외)
  let contact = '정보없음';
  const contactNumber = extractContactNumber(rawText);
  if (contactNumber) {
    contact = `${contactNumber}`;
  }

  // 모든 항목 결합 (빈 항목도 포함)
  const result = [
    propertyInfo,
    `• 소재지: ${location}`,
    `• 임대료: ${rent}`,
    `• 구조정보: ${structure}`,
    `• 동/층: ${floorInfo}`,
    `• 특징: ${feature}`,
    `• 부동산: ${agency}`,
    `• 연락처: ${contact}`
  ].join('\n');

  return result;
};

/**
 * 원본/정리본 포맷에서 지번 추출
 * 원본: "소 재 지" 라벨 다음 내용
 * 정리본: "소재지:" 라벨 다음의 지번 추출
 * @param {string} text - 매물 정보 전체 텍스트
 * @returns {string} - 추출된 지번
 */
export const extractJibun = (text) => {
  if (!text) return '';

  const lines = text.split('\n');

  // 1. 원본 포맷: "소 재 지" 라벨 찾기
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // "소 재 지" 또는 "소재지" 라벨 찾기
    if (line.match(/소\s*재\s*지/) || line.includes('소재지')) {
      // 같은 라인에서 라벨 뒤의 내용 추출
      const match = line.match(/소\s*재\s*지\s+(.+?)(?:\s{2,}|공개여부|$)/);
      if (match) {
        return match[1].trim();
      }
      // 같은 라인에서 못 찾으면 다음 라인에서 찾기
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine && !nextLine.match(/^(공개여부|공개|단위|건물|주소|연면|분양|보증)/)) {
          return nextLine;
        }
      }
    }
  }

  // 2. 정리본 포맷: "소재지:" 라벨에서 지번 추출
  for (const line of lines) {
    if (line.includes('소재지:')) {
      // "• 소재지: 건물명(지번주소)" 형식에서 괄호 안의 지번 추출
      const match = line.match(/소재지:\s*.+?\((.+?)\)/);
      if (match) {
        return match[1].trim();
      }
    }
  }

  return '';
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
