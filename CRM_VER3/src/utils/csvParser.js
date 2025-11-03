/**
 * CSV 파일을 매물 데이터로 변환
 * @param {string} csvContent - CSV 파일의 텍스트 내용
 * @returns {Array} 매물 데이터 배열
 */
export const parsePropertyCSV = (csvContent) => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV 파일이 비어있거나 헤더가 없습니다.');
  }

  // 헤더 파싱
  const headers = parseCSVLine(lines[0]);

  // 필드 매핑 (유연한 헤더 지원)
  const fieldMapping = {
    'createdAt': ['접수일', 'created_at', 'createdAt', '등록일'],
    'buildingName': ['건물명', 'building_name', 'buildingName'],
    'roomNumber': ['호실명', 'room_number', 'roomNumber'],
    'propertyType': ['매물유형', 'property_type', 'propertyType', '유형'],
    'category': ['구분', 'category'],
    'price': ['금액', 'price', '가격'],
    'moveInDate': ['입주일', 'move_in_date', 'moveInDate', '입주시기'],
    'ownerName': ['소유자', 'owner_name', 'ownerName'],
    'ownerPhone': ['소유자번호', 'owner_phone', 'ownerPhone', '소유자연락처'],
    'leaseInfo': ['임대차정보', 'lease_info', 'leaseInfo'],
    'tenantPhone': ['점주번호', 'tenant_phone', 'tenantPhone', '점주연락처'],
    'memo': ['메모', 'memo', '비고']
  };

  // 헤더에서 필드 인덱스 찾기
  const columnIndices = {};
  Object.entries(fieldMapping).forEach(([field, aliases]) => {
    const index = headers.findIndex(h =>
      aliases.includes(h.trim())
    );
    if (index !== -1) {
      columnIndices[field] = index;
    }
  });

  // 필수 필드 확인
  if (columnIndices['buildingName'] === undefined) {
    throw new Error('필수 필드 "건물명"을 찾을 수 없습니다.');
  }

  // 데이터 행 파싱
  const properties = [];
  let counter = 0; // 카운터 추가
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // 빈 줄 스킵

    try {
      const values = parseCSVLine(line);

      // 접수일 처리: CSV에 있으면 그 값 사용, 없으면 현재 시간
      let createdAtValue = getValue(values, columnIndices['createdAt'], '');
      let createdAt;
      if (createdAtValue.trim()) {
        // YYYY-MM-DD 형식을 ISO 형식으로 변환
        const date = new Date(createdAtValue.trim());
        createdAt = date.toString() === 'Invalid Date' ? new Date().toISOString() : date.toISOString();
      } else {
        createdAt = new Date().toISOString();
      }

      const property = {
        id: generateId(counter++), // 카운터 전달
        createdAt: createdAt,
        buildingName: getValue(values, columnIndices['buildingName'], ''),
        roomNumber: getValue(values, columnIndices['roomNumber'], ''),
        propertyType: getValue(values, columnIndices['propertyType'], '매매'),
        category: getValue(values, columnIndices['category'], '오피스텔'),
        price: parseInt(getValue(values, columnIndices['price'], '0'), 10) || 0,
        moveInDate: getValue(values, columnIndices['moveInDate'], ''),
        ownerName: getValue(values, columnIndices['ownerName'], ''),
        ownerPhone: getValue(values, columnIndices['ownerPhone'], ''),
        leaseInfo: getValue(values, columnIndices['leaseInfo'], ''),
        tenantPhone: getValue(values, columnIndices['tenantPhone'], ''),
        memo: getValue(values, columnIndices['memo'], '')
      };

      // 건물명이 있으면 추가
      if (property.buildingName.trim()) {
        properties.push(property);
      }
    } catch (error) {
      console.warn(`CSV 행 ${i + 1} 파싱 오류:`, error.message);
    }
  }

  if (properties.length === 0) {
    throw new Error('유효한 매물 데이터를 찾을 수 없습니다.');
  }

  return properties;
};

/**
 * CSV 라인을 필드 배열로 파싱 (쌍따옴표 처리 포함)
 * @param {string} line - CSV 한 줄
 * @returns {Array} 필드 배열
 */
const parseCSVLine = (line) => {
  const fields = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 이스케이프된 쌍따옴표
        currentField += '"';
        i++; // 다음 문자 스킵
      } else {
        // 쌍따옴표 토글
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 필드 구분자
      fields.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // 마지막 필드 추가
  fields.push(currentField.trim());

  return fields;
};

/**
 * 값 추출 (인덱스와 기본값 처리)
 * @param {Array} values - 값 배열
 * @param {number} index - 인덱스
 * @param {*} defaultValue - 기본값
 * @returns {*} 추출된 값
 */
const getValue = (values, index, defaultValue) => {
  if (index === undefined || index === -1 || values[index] === undefined) {
    return defaultValue;
  }
  const value = values[index].trim();
  return value || defaultValue;
};

/**
 * CSV 파일을 건물 데이터로 변환
 * @param {string} csvContent - CSV 파일의 텍스트 내용
 * @returns {Array} 건물 데이터 배열
 */
export const parseBuildingCSV = (csvContent) => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV 파일이 비어있거나 헤더가 없습니다.');
  }

  // 헤더 파싱
  const headers = parseCSVLine(lines[0]);

  // 필드 매핑 (유연한 헤더 지원)
  const fieldMapping = {
    'createdAt': ['접수일', 'created_at', 'createdAt', '등록일'],
    'name': ['건물명', 'building_name', 'name', '이름'],
    'address': ['지번', 'address', '주소'],
    'approvalDate': ['사용승인일', 'approval_date', 'approvalDate'],
    'floors': ['층수', 'floors'],
    'parking': ['주차', 'parking', '주차대수', 'parking_count'],
    'units': ['세대수', 'units', '유닛수', 'unit_count'],
    'entrance': ['공동현관비번', '공동현관', 'entrance', 'entrance_code', '공동현관비밀번호'],
    'office': ['관리실번호', '관리실', 'office', 'office_number'],
    'location': ['위치', 'location'],
    'type': ['유형', 'type', '건물유형', 'building_type'],
    'memo': ['메모', 'memo', '비고']
  };

  // 헤더에서 필드 인덱스 찾기
  const columnIndices = {};
  Object.entries(fieldMapping).forEach(([field, aliases]) => {
    const index = headers.findIndex(h =>
      aliases.includes(h.trim())
    );
    if (index !== -1) {
      columnIndices[field] = index;
    }
  });

  // 필수 필드 확인
  if (columnIndices['name'] === undefined || columnIndices['address'] === undefined) {
    throw new Error('필수 필드 "건물명"과 "지번"을 찾을 수 없습니다.');
  }

  // 데이터 행 파싱
  const buildings = [];
  let counter = 0; // 카운터 추가
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // 빈 줄 스킵

    try {
      const values = parseCSVLine(line);

      // 접수일 처리: CSV에 있으면 그 값 사용, 없으면 현재 시간
      let createdAtValue = getValue(values, columnIndices['createdAt'], '');
      let createdAt;
      if (createdAtValue.trim()) {
        // YYYY-MM-DD 형식을 ISO 형식으로 변환
        const date = new Date(createdAtValue.trim());
        createdAt = date.toString() === 'Invalid Date' ? new Date().toISOString() : date.toISOString();
      } else {
        createdAt = new Date().toISOString();
      }

      const building = {
        id: generateId(counter++), // 카운터 전달
        createdAt: createdAt,
        name: getValue(values, columnIndices['name'], ''),
        address: getValue(values, columnIndices['address'], ''),
        approvalDate: getValue(values, columnIndices['approvalDate'], ''),
        floors: getValue(values, columnIndices['floors'], ''),
        parking: getValue(values, columnIndices['parking'], ''),
        units: getValue(values, columnIndices['units'], ''),
        entrance: getValue(values, columnIndices['entrance'], ''),
        office: getValue(values, columnIndices['office'], ''),
        location: getValue(values, columnIndices['location'], ''),
        type: getValue(values, columnIndices['type'], ''),
        memo: getValue(values, columnIndices['memo'], '')
      };

      // 건물명과 지번이 있으면 추가
      if (building.name.trim() && building.address.trim()) {
        buildings.push(building);
      }
    } catch (error) {
      console.warn(`CSV 행 ${i + 1} 파싱 오류:`, error.message);
    }
  }

  if (buildings.length === 0) {
    throw new Error('유효한 건물 데이터를 찾을 수 없습니다.');
  }

  return buildings;
};

/**
 * ID 생성 (카운터 추가로 중복 방지)
 * @param {number} counter - 순차적 카운터
 * @returns {string} 고유 ID
 */
const generateId = (counter = 0) => {
  return `${Date.now()}_${counter}_${Math.random().toString(36).substr(2, 9)}`;
};
