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
 * CSV 파일을 계약호실 데이터로 변환
 * @param {string} csvContent - CSV 파일의 텍스트 내용
 * @returns {Array} 계약호실 데이터 배열
 */
export const parseContractCSV = (csvContent) => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV 파일이 비어있거나 헤더가 없습니다.');
  }

  // 헤더 파싱
  const headers = parseCSVLine(lines[0]);

  // 필드 매핑
  const fieldMapping = {
    'createdAt': ['접수일', 'created_at', 'createdAt', '등록일'],
    'buildingName': ['건물명', 'building_name', 'buildingName'],
    'roomName': ['호실명', 'room_name', 'roomName', '호실'],
    'progressStatus': ['진행상황', 'progress_status', 'progressStatus'],
    'propertyManagement': ['매물관리', 'property_management', 'propertyManagement'],
    'expiryManagement': ['만기관리', 'expiry_management', 'expiryManagement'],
    'contractDate': ['계약서작성일', 'contract_date', 'contractDate'],
    'balanceDate': ['잔금일', 'balance_date', 'balanceDate'],
    'expiryDate': ['만기일', 'expiry_date', 'expiryDate'],
    'landlordName': ['임대인이름', 'landlord_name', 'landlordName', '임대인'],
    'landlordPhone': ['임대인번호', 'landlord_phone', 'landlordPhone', '임대인연락처'],
    'tenantName': ['임차인이름', 'tenant_name', 'tenantName', '임차인'],
    'tenantPhone': ['임차인번호', 'tenant_phone', 'tenantPhone', '임차인연락처']
  };

  // 헤더에서 필드 인덱스 찾기
  const columnIndices = {};
  Object.entries(fieldMapping).forEach(([field, aliases]) => {
    const index = headers.findIndex(h => aliases.includes(h.trim()));
    if (index !== -1) {
      columnIndices[field] = index;
    }
  });

  // 필수 필드 확인
  if (columnIndices['buildingName'] === undefined || columnIndices['roomName'] === undefined) {
    throw new Error('필수 필드 "건물명"과 "호실명"을 찾을 수 없습니다.');
  }

  // 데이터 행 파싱
  const contracts = [];
  let counter = 0;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);

      // 접수일 처리
      let createdAtValue = getValue(values, columnIndices['createdAt'], '');
      let createdAt;
      if (createdAtValue.trim()) {
        const date = new Date(createdAtValue.trim());
        createdAt = date.toString() === 'Invalid Date' ? new Date().toISOString() : date.toISOString();
      } else {
        createdAt = new Date().toISOString();
      }

      // 날짜를 "YYYY. M. D" 형식으로 변환 (현재는 ISO 형식으로 저장하고 표시 시 변환)
      const formatDateInput = (dateStr) => {
        if (!dateStr || !dateStr.trim()) return '';
        // 만약 "2025. 8. 13" 형식이면 "2025-08-13"으로 변환
        if (dateStr.includes('.')) {
          const parts = dateStr.replace(/\./g, '').trim().split(' ');
          if (parts.length === 3) {
            return `${parts[0]}-${String(parts[1]).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`;
          }
        }
        return dateStr; // 그대로 반환 (YYYY-MM-DD 형식이라고 가정)
      };

      const contract = {
        id: generateId(counter++),
        createdAt: createdAt,
        buildingName: getValue(values, columnIndices['buildingName'], ''),
        roomName: getValue(values, columnIndices['roomName'], ''),
        progressStatus: getValue(values, columnIndices['progressStatus'], '계약서작성'),
        propertyManagement: getValue(values, columnIndices['propertyManagement'], ''),
        expiryManagement: getValue(values, columnIndices['expiryManagement'], ''),
        contractDate: formatDateInput(getValue(values, columnIndices['contractDate'], '')),
        balanceDate: formatDateInput(getValue(values, columnIndices['balanceDate'], '')),
        expiryDate: formatDateInput(getValue(values, columnIndices['expiryDate'], '')),
        landlordName: getValue(values, columnIndices['landlordName'], ''),
        landlordPhone: getValue(values, columnIndices['landlordPhone'], ''),
        tenantName: getValue(values, columnIndices['tenantName'], ''),
        tenantPhone: getValue(values, columnIndices['tenantPhone'], '')
      };

      // 건물명과 호실명이 있으면 추가
      if (contract.buildingName.trim() && contract.roomName.trim()) {
        contracts.push(contract);
      }
    } catch (error) {
      console.warn(`CSV 행 ${i + 1} 파싱 오류:`, error.message);
    }
  }

  if (contracts.length === 0) {
    throw new Error('유효한 계약호실 데이터를 찾을 수 없습니다.');
  }

  return contracts;
};

/**
 * ID 생성 (카운터 추가로 중복 방지)
 * @param {number} counter - 순차적 카운터
 * @returns {string} 고유 ID
 */
const generateId = (counter = 0) => {
  return `${Date.now()}_${counter}_${Math.random().toString(36).substr(2, 9)}`;
};

// ========== 범용 CSV 파서 (동적 테이블용) ==========

// 데이터 타입 추론 (샘플 값 기반)
export const inferDataType = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'text';
  }

  const trimmedValue = String(value).trim();

  // 날짜 판별 (YYYY-MM-DD, YYYY/MM/DD, MM/DD/YYYY 등)
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(trimmedValue) ||
      /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(trimmedValue) ||
      /^\d{4}\d{1,2}\d{1,2}$/.test(trimmedValue)) {
    return 'date';
  }

  // 숫자 판별
  if (!isNaN(trimmedValue) && trimmedValue !== '') {
    return 'number';
  }

  return 'text';
};

// CSV 데이터를 객체 배열로 변환
export const csvToObjects = (csvText) => {
  const rows = parseCSVData(csvText);

  if (rows.length === 0) {
    return { headers: [], data: [] };
  }

  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });

  return { headers, data };
};

// CSV 파싱 헬퍼 (기존 parseCSVLine과 동일하게 작동)
const parseCSVData = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  const rows = [];

  lines.forEach(line => {
    const cells = parseCSVLine(line);
    rows.push(cells);
  });

  return rows;
};

// 컬럼 메타데이터 생성 (헤더와 데이터 샘플을 기반으로)
export const generateColumnMetadata = (headers, dataRows) => {
  return headers.map((header, index) => {
    // Firestore 필드명 sanitize
    const sanitizedHeader = header.replace(/\//g, '_').replace(/\\/g, '_');
    let dataType = 'text';
    let hasNull = false;

    // 처음 10개 행의 데이터를 샘플링하여 타입 추론
    for (let i = 0; i < Math.min(10, dataRows.length); i++) {
      const value = dataRows[i][header];

      if (value === null || value === undefined || value === '') {
        hasNull = true;
      } else {
        const inferredType = inferDataType(value);
        if (inferredType !== 'text') {
          dataType = inferredType;
          break;
        }
      }
    }

    return {
      name: sanitizedHeader,
      type: dataType,
      required: !hasNull,
      display: true
    };
  });
};

// 파일에서 CSV 텍스트 읽기
export const readCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const csvText = event.target.result;
        resolve(csvText);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file, 'UTF-8');
  });
};

// CSV 데이터를 테이블 행 데이터로 변환 (ID, 타임스탐프 추가)
export const transformCSVDataToTableRows = (csvData) => {
  return csvData.map((row, index) => {
    // Sanitize field names to remove problematic characters for Firestore
    const sanitizedRow = {};
    Object.keys(row).forEach(key => {
      // Firestore 필드명에서 "/" 제거
      const sanitizedKey = key.replace(/\//g, '_').replace(/\\/g, '_');
      sanitizedRow[sanitizedKey] = row[key];
    });

    return {
      id: `row_${Date.now()}_${index}`,
      ...sanitizedRow,
      createdAt: new Date().toISOString()
    };
  });
};

// 전체 파이프라인: 파일 → CSV → 객체 배열 → 컬럼 메타데이터 + 데이터
export const processCSVFile = async (file) => {
  try {
    const csvText = await readCSVFile(file);
    const { headers, data } = csvToObjects(csvText);

    if (headers.length === 0 || data.length === 0) {
      throw new Error('CSV 파일이 비어있거나 유효하지 않습니다.');
    }

    const columns = generateColumnMetadata(headers, data);
    const tableRows = transformCSVDataToTableRows(data);

    return {
      success: true,
      columns,
      data: tableRows,
      rowCount: data.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// CSV 객체 배열을 CSV 문자열로 변환 (내보내기용)
export const objectsToCSV = (objects, columns = null) => {
  if (!objects || objects.length === 0) {
    return '';
  }

  let headers = [];
  if (columns) {
    headers = columns.map(col => col.name);
  } else {
    headers = Object.keys(objects[0]).filter(key =>
      key !== 'id' && key !== 'createdAt' && key !== 'updatedAt'
    );
  }

  const headerRow = headers.map(escapeCSVField).join(',');

  const dataRows = objects.map(obj => {
    return headers.map(header => {
      const value = obj[header];
      return escapeCSVField(value);
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

// CSV 필드 이스케이프 (따옴표 처리)
const escapeCSVField = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

// CSV 파일 다운로드 (객체 배열)
export const downloadCSV = (filename, objects, columns = null) => {
  const csvContent = objectsToCSV(objects, columns);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
