# Claude Code 작업 규칙

## 중요 규칙

### Git Push
- **원칙**: 사용자가 명시적으로 "푸쉬해줘" 또는 "푸시해줘"라고 요청할 때만 `git push` 실행
- **절차**:
  1. 코드 수정 완료 후 `git add` 및 `git commit` 실행
  2. 커밋 메시지에 "🤖 Generated with Claude Code"와 "Co-Authored-By: Claude <noreply@anthropic.com>" 포함
  3. 사용자 명시 요청이 있을 때까지 대기 (자동으로 푸시하지 않음)
  4. 사용자가 요청하면 `git push` 실행

### 연락처 파싱 규칙
- **우선순위**: 02- (서울) > 핸드폰 (010-) > 기타 지역번호
- **제외 대상**: 팩스번호, 관리소전화 (관리소, 관리팀, 관리사무소 라벨)
- **추출 위치**: 공인중개사사무소 또는 중개법인 뒤의 5개 라인 범위 내
- **관리소전화 무시**: "관리소", "관리팀", "관리사무소" 라벨이 있는 번호는 제외

### 부동산명 추출 규칙
- **1차**: 공인중개사 + 사무소 패턴
- **2차**: 중개법인 패턴
- 둘 다 매칭되지 않으면 부동산명 미추출

### 지역 정보
- **프로젝트 경로**: C:\Users\User\Desktop\앱개발\CRM_VER.4\CRM_VER.4\CRM_VER3
- **주요 파일**:
  - src/utils/textParser.js (매물정보 파싱)
  - src/index.css (스타일)
  - src/components/CustomerDetailPanel/ (고객상세페이지 컴포넌트)

## 새로운 기능 개발 시 UI/UX 원칙

### 원칙 1: 고객목록 UI/UX가 모든 기능의 기준
- **개념**: 고객목록(CustomerTable)의 UI 레이아웃, 디자인, 동작이 새로운 기능의 기본 참고 모델
- **적용 대상**:
  - 필드 배치 및 구성
  - 컴포넌트 구조 (Table + Modal + DetailPanel)
  - 레이아웃과 여백
  - 색상 및 타이포그래피
  - 상호작용 패턴
- **예시**:
  - 고객목록: 접수일, 고객명, 전화, 활동일, 미팅일 열 구성
  - 매물장: 접수일, 매물명, 금액, 입주일, 소유자 열 구성 (구조 유사)
  - 건물정보: 건물명, 지번, 층수, 주차, 관리번호 열 구성 (구조 유사)

### 원칙 2: 좌측 사이드바 필터는 기능별 독립적 운영
- **개념**: 각 기능(고객, 매물, 건물)은 자신의 고유한 필터를 독립적으로 운영
- **구현 방식**:
  ```javascript
  // FilterSidebar.jsx에서 activeTab에 따라 다른 필터 표시
  const renderFilters = () => {
    switch(activeTab) {
      case 'customer': return renderCustomerFilters();  // 신규, 진행중, 장기관리, 보류, 집중고객 등
      case 'property': return renderPropertyFilters();  // 매물유형별, 상태별 필터 (필요 시)
      case 'building': return renderBuildingFilters();  // 지역별, 유형별 필터 (필요 시)
      default: return null;
    }
  };
  ```
- **주의사항**:
  - 한 기능의 필터가 다른 기능에 영향을 주면 안 됨
  - 각 기능의 활성 필터는 독립적으로 저장 (상태 변수 분리)
  - 탭 전환 시 이전 필터 상태 유지

### 원칙 3: 테이블뷰 형식은 고객목록 테이블뷰를 기준
- **헤더 스타일**:
  - 배경색: `#4CAF50` (녹색)
  - 글자색: `white`
  - 폰트 굵기: `bold`
  - 패딩: `12px`
  - CSS 클래스: `.customer-table thead th`

- **셀 스타일**:
  - 기본 폰트 크기: `14px` (CSS에서 상속)
  - 패딩: `12px`
  - 테두리: `1px solid #e0e0e0`
  - CSS 클래스: `.customer-table td`

- **행 색상 (교차색상)**:
  - 짝수 행: `#ffffff` (흰색)
  - 홀수 행: `#f5f5f5` (밝은 회색)
  - 선택된 행: `#e3f2fd` (밝은 파란색)
  - 호버 상태: `#dcfce7` (연한 초록색)

- **테이블 기능**:
  - 검색바: 상단에 위치, 초기화 버튼 포함
  - 정렬: 헤더 클릭 시 정렬 (▲/▼ 표시)
  - 컨텍스트 메뉴: 우클릭 시 수정/삭제 옵션
  - 빈 상태: `"{searchTerm ? '검색 결과가 없습니다' : '등록된 {Entity}가 없습니다'}"`

- **구현 예시**:
  ```javascript
  // 모든 테이블 공통 구조
  <div className="property-table-container">
    {/* 검색 바 */}
    <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
      <input placeholder="검색..." />
      {searchTerm && <button onClick={() => setSearchTerm('')}>초기화</button>}
    </div>

    {/* 테이블 */}
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {items.length > 0 ? (
        <table className="customer-table">
          <thead><tr>{/* SortHeader 컴포넌트 사용 */}</tr></thead>
          <tbody>{/* 행 렌더링 */}</tbody>
        </table>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          등록된 항목이 없습니다
        </div>
      )}
    </div>
  </div>
  ```

### 원칙 4: 상세 사이드바의 동작과 위치는 고객목록 기준
- **위치**: 화면 오른쪽에 고정된 패널 (992px 너비)
  - CSS: `.detail-panel.open { width: 972px; }`
  - 모바일: 전체 화면 차지

- **열기/닫기**:
  - 열기: 목록의 행 클릭
  - 닫기: 패널의 X 버튼 또는 패널 외부 클릭
  - 상태: `selectedPropertyId`로 관리

- **패널 내부 구조**:
  ```javascript
  {/* 헤더 */}
  <div className="panel-header">
    <div>
      <h3>항목명</h3>
      <p style={{ fontSize: '13px', color: '#999' }}>추가 정보</p>
    </div>
    <button className="btn-close" onClick={onClose}>✕</button>
  </div>

  {/* 탭 네비게이션 */}
  <div className="segmented-control">
    <button className={activeTab === 'basic' ? 'active' : ''}>기본정보</button>
    <button className={activeTab === 'activity' ? 'active' : ''}>활동</button>
    <button className={activeTab === 'note' ? 'active' : ''}>메모</button>
  </div>

  {/* 탭 콘텐츠 */}
  <div className="panel-content">
    {activeTab === 'basic' && <BasicInfo />}
    {activeTab === 'activity' && <ActivityList />}
    {activeTab === 'note' && <NotesSection />}
  </div>

  {/* 액션 버튼 */}
  <div className="panel-footer">
    <button onClick={onEdit}>수정</button>
    <button onClick={onDelete} className="btn-danger">삭제</button>
  </div>
  ```

- **동작 특성**:
  - 스크롤: 패널 내용만 스크롤 (패널 바깥은 스크롤 안 함)
  - 전환: 부드러운 슬라이드 애니메이션 (0.3s)
  - 데이터 실시간 반영: 수정/삭제 후 패널 자동 업데이트
  - 목록과 패널 동기화: 한쪽이 변경되면 다른 쪽도 자동 갱신

## 기능별 구현 체크리스트

새로운 기능 추가 시 다음을 확인하세요:

- [ ] **파일 구조**
  - [ ] `{Entity}Table.jsx` 생성
  - [ ] `{Entity}Modal.jsx` 생성
  - [ ] `{Entity}DetailPanel.jsx` 생성 (필요 시)
  - [ ] `constants.js`에 필수 상수 추가

- [ ] **App.jsx 연결**
  - [ ] 상태 변수: `[items, setItems]`, `[selectedId, setSelectedId]`, `[isModalOpen, setIsModalOpen]`
  - [ ] Firebase 구독: `subscribeTo{Entities}` 함수
  - [ ] 핸들러: `handleSelect`, `handleOpenModal`, `handleCloseModal`, `handleSave`, `handleDelete`
  - [ ] 탭 추가: FilterSidebar와 main content 영역

- [ ] **UI 일관성**
  - [ ] 테이블 헤더: CSS `.customer-table` 클래스 사용
  - [ ] 테이블 색상: 고객목록과 동일
  - [ ] 검색바: 초기화 버튼 포함
  - [ ] 상세 패널: 오른쪽 슬라이드 구조

- [ ] **필터 관리**
  - [ ] FilterSidebar에 해당 기능 필터 추가
  - [ ] 필터 상태 변수 분리 (다른 기능에 영향 안 줌)
  - [ ] 필터 레이아웃: 고객목록의 필터 구조 참고

## CSV 임포트 기능

### 개요
- **목적**: CSV 파일을 통해 초기데이터 마이그레이션 및 대량 데이터 업로드
- **동작**: 새로운 데이터 임포트 시 기존 데이터는 모두 삭제되고 새 데이터로 교체
- **대상**: 고객, 매물, 건물 데이터

### 구현 대상 엔티티
- **PropertyImporter.jsx** (매물 임포트)
- **BuildingImporter.jsx** (건물 임포트)
- **CustomerImporter.jsx** (고객 임포트) - 필요 시 추가

### CSV 파일 형식

#### 매물(Property) CSV 예시
```
접수일,매물유형,구분,건물명,방번호,금액,입주일,소유자,소유자번호,점주번호
2024-11-01,오피스텔,구분,더 현대 오피스텔,101,15000000,2025-01-15,김철수,010-1111-1111,010-2222-2222
2024-11-02,주택,분양,강남 아파트,205,500000,2025-02-01,이영희,010-3333-3333,010-4444-4444
```

#### 건물(Building) CSV 예시
```
건물명,지번,공동현관비번,층수,주차,관리실번호
더 현대 오피스텔,강남구 역삼동 123-45,1234,25,50,010-1111-1111
강남 아파트,강남구 논현동 678-90,5678,15,20,010-2222-2222
```

#### 고객(Customer) CSV 예시
```
고객명,전화,출처,매물유형,선호지역,희망전세금,희망월세,입주예정일,메모,상태
홍길동,010-1234-5678,블로그,월세,강남구 역삼동,1000,50,2024-12-01,빠른 입주 희망,신규
김철수,010-9876-5432,네이버광고,전세,서초구 서초동,5000,0,2025-01-15,조용한 집 선호,상담중
```

### 구현 로직

#### 1. 파일 읽기
```javascript
// CSV 파일을 읽고 배열로 변환
const readCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',');
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index]?.trim();
          });
          return obj;
        });
      resolve(data);
    };
    reader.onerror = reject;
  });
};
```

#### 2. 데이터 변환 및 검증
```javascript
const parsePropertyData = (csvData) => {
  return csvData.map((row, index) => ({
    id: `prop_${Date.now()}_${index}`,
    createdAt: row.접수일 || new Date().toISOString().split('T')[0],
    propertyType: row.매물유형 || '',
    category: row.구분 || '',
    buildingName: row.건물명 || '',
    roomNumber: row.방번호 || '',
    price: row.금액 || 0,
    moveInDate: row.입주일 || '',
    ownerName: row.소유자 || '',
    ownerPhone: row.소유자번호 || '',
    tenantPhone: row.점주번호 || '',
  }));
};
```

#### 3. 기존 데이터 삭제 및 새 데이터 저장
```javascript
const handlePropertyImport = async (csvFile) => {
  try {
    // 1. CSV 파일 읽기
    const csvData = await readCSV(csvFile);

    // 2. 데이터 변환
    const properties = parsePropertyData(csvData);

    // 3. 기존 데이터 모두 삭제
    const existingProperties = properties; // 현재 상태의 데이터
    for (const prop of existingProperties) {
      await deleteProperty(prop.id);
    }

    // 4. 새 데이터 저장
    await saveProperties(properties);

    // 5. UI 업데이트
    setProperties(properties);
    showSuccessMessage(`${properties.length}개의 매물이 임포트되었습니다.`);
  } catch (error) {
    showErrorMessage(`임포트 실패: ${error.message}`);
  }
};
```

### Importer 컴포넌트 구조

#### PropertyImporter.jsx / BuildingImporter.jsx 공통 구조
```javascript
const PropertyImporter = ({ onComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files[0]) {
      handleImport(files[0]);
    }
  };

  const handleImport = async (file) => {
    if (!file.name.endsWith('.csv')) {
      alert('CSV 파일만 선택할 수 있습니다.');
      return;
    }

    // 임포트 로직 수행
    try {
      const data = await readCSV(file);
      const parsed = parsePropertyData(data);

      // 확인 다이얼로그
      const confirmed = window.confirm(
        `${parsed.length}개의 매물을 임포트합니다.\n기존 데이터는 모두 삭제됩니다.`
      );

      if (confirmed) {
        await performImport(parsed);
        onComplete();
      }
    } catch (error) {
      alert(`임포트 실패: ${error.message}`);
    }
  };

  return (
    <div
      style={{
        border: '2px dashed #ccc',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        backgroundColor: isDragging ? '#f0f0f0' : '#fff',
        cursor: 'pointer'
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files[0] && handleImport(e.target.files[0])}
      />
      <p>CSV 파일을 여기에 드래그하거나 클릭하여 선택</p>
      <small style={{ color: '#999' }}>지원 형식: .csv</small>
    </div>
  );
};
```

### App.jsx 연결
```javascript
// App.jsx에 상태 추가
const [isPropertyImporterOpen, setIsPropertyImporterOpen] = useState(false);
const [isBuildingImporterOpen, setIsBuildingImporterOpen] = useState(false);

// 임포트 버튼 추가 (FilterSidebar 또는 주요 액션 바에)
<button onClick={() => setIsPropertyImporterOpen(true)}>
  CSV 임포트
</button>

// 임포트 모달 열기
{isPropertyImporterOpen && (
  <PropertyImporter
    onComplete={() => {
      setIsPropertyImporterOpen(false);
      // 데이터 새로고침
    }}
  />
)}
```

### 주의사항
- **데이터 손실**: 임포트 시 기존 모든 데이터가 삭제되므로 반드시 확인 메시지 표시
- **CSV 형식**: 헤더 행이 반드시 포함되어야 함
- **인코딩**: UTF-8 인코딩 권장
- **날짜 형식**: YYYY-MM-DD 형식 권장
- **에러 처리**: 파싱 오류 시 상세 에러 메시지 제공

### 테스트용 샘플 CSV 파일 경로
- 프로젝트 폴더 내 `sample-data/` 디렉토리에 저장 권장
- `sample-property.csv`, `sample-building.csv`, `sample-customer.csv` 제공

## 계약호실 기능

### 개요
- **목적**: 계약이 완료된 호실의 정보를 독립적으로 관리 및 추적
- **특징**: 계약상태별(진행중/만료/해지)으로 색상으로 구분하여 표시
- **독립성**: 다른 기능(고객, 매물, 건물)과 완전히 독립적으로 운영

### 데이터 모델
```javascript
{
  id: string,                    // 고유 ID
  createdAt: string,             // 접수일 (ISO 문자열)
  buildingName: string,          // 건물명
  roomNumber: string,            // 호실번호
  contractDate: string,          // 계약일 (YYYY-MM-DD)
  contractorName: string,        // 계약자명
  contractAmount: number,        // 계약금액 (만원)
  contractStatus: string,        // '진행중', '만료', '해지'
  memo: string                   // 메모
}
```

### UI 구성

#### 테이블 열
- 접수일 (정렬 가능)
- 건물명 (검색 가능)
- 호실번호 (검색 가능)
- 계약일 (정렬 가능)
- 계약자명 (정렬/검색 가능)
- 계약금액 (정렬 가능)
- 상태 (정렬 가능)

#### 필터 (독립적 운영)
- **전체**: 모든 계약호실
- **진행중**: 진행중 상태의 계약호실
- **만료**: 만료된 계약호실
- **해지**: 해지된 계약호실

#### 색상 구분
- **진행중**: 초록색 배경 (`#e8f5e9`)
- **만료**: 노란색 배경 (`#fff9c4`)
- **해지**: 빨간색 배경 (`#ffebee`)

### 주요 기능

#### 1. 목록 관리
- **검색**: 건물명, 호실번호, 계약자명으로 검색 가능
- **정렬**: 모든 컬럼 헤더 클릭으로 정렬 (오름차순/내림차순 토글)
- **필터**: 상태별로 필터링
- **우클릭 메뉴**: 행 우클릭 시 수정/삭제 옵션

#### 2. CRUD 작업
- **추가**: "+ 계약호실 추가" 버튼으로 신규 등록
- **수정**: 목록에서 행 선택 또는 우클릭으로 상세패널 열기 → 수정 버튼
- **삭제**: 우클릭 메뉴 또는 상세패널의 삭제 버튼
- **조회**: 목록에서 행 클릭으로 상세패널 오픈

#### 3. 상세 패널
- 위치: 화면 우측 고정 패널
- 구성: 기본정보 섹션만 포함 (탭 없음)
- 정보 표시:
  - 건물명, 호실번호
  - 계약일, 계약자명
  - 계약금액, 계약상태
  - 메모
  - 접수일 (추가정보)
- 액션: 수정/삭제 버튼

### 폼 유효성 검사
필수 필드:
- 건물명 (필수)
- 호실번호 (필수)
- 계약일 (필수, 날짜 형식)
- 계약자명 (필수)
- 계약금액 (필수, 0 이상)
- 계약상태 (필수, 드롭다운 선택)

선택 필드:
- 메모

### 구현 파일

#### 새로 생성된 파일
1. **ContractTable.jsx** - 계약호실 목록 테이블
   - 검색, 정렬, 필터링 기능
   - 컨텍스트 메뉴 (우클릭)
   - 상태별 색상 구분

2. **ContractModal.jsx** - 계약호실 추가/수정 폼
   - 7개 필드 입력 폼
   - 폼 유효성 검사
   - 에러 메시지 표시

3. **ContractDetailPanel.jsx** - 계약호실 상세정보 패널
   - 읽기 전용 정보 표시
   - 상태별 배경색 표시
   - 수정/삭제 버튼

#### 수정된 파일
1. **constants.js**
   - `CONTRACT_STATUSES = ['진행중', '만료', '해지']` 추가

2. **storage.js**
   - `subscribeToContracts()` - 실시간 구독
   - `getContracts()` - 전체 조회
   - `saveContract()` - 단일 저장
   - `saveContracts()` - 다중 저장
   - `deleteContract()` - 삭제

3. **FilterSidebar.jsx**
   - 계약호실 필터 로직 추가
   - 상태별 카운트 표시

4. **App.jsx**
   - 계약호실 상태 변수 추가 (contracts, selectedContractId 등)
   - Firebase 구독 추가 (subscribeToContracts)
   - CRUD 핸들러 함수 추가
   - 필터링 로직 추가 (filteredContracts)
   - 탭바에 "📄 계약호실" 버튼 추가
   - 테이블/모달/상세패널 렌더링

### 사용 방법

#### 계약호실 추가
1. "📄 계약호실" 탭 클릭
2. "+ 계약호실 추가" 버튼 클릭
3. 폼에 필요한 정보 입력
4. "저장" 버튼 클릭

#### 계약호실 수정
1. 목록에서 항목 클릭 또는 우클릭 → "수정"
2. 정보 수정
3. "저장" 버튼 클릭

#### 계약호실 삭제
1. 목록에서 항목 우클릭 → "삭제" 또는
2. 상세패널에서 "삭제" 버튼 클릭
3. 확인 다이얼로그 확인

#### 필터링
1. 좌측 사이드바에서 상태 필터 선택
2. 해당 상태의 계약호실만 표시

### 주요 특징

| 특징 | 설명 |
|------|------|
| **독립성** | 다른 기능과 연결 없이 독립적으로 운영 |
| **색상 구분** | 계약상태(진행중/만료/해지)를 색상으로 시각화 |
| **동적 필터** | 사이드바에서 상태별로 즉시 필터링 |
| **상태 표시** | 목록과 상세패널에서 계약상태를 명확히 표시 |
| **검색 기능** | 건물명, 호실번호, 계약자명으로 검색 가능 |
| **정렬 기능** | 모든 주요 컬럼으로 정렬 가능 |
| **메모 관리** | 추가 사항 기록 가능 |

## 확인 날짜
- 작성: 2025-10-20
- 최종 업데이트: 2025-11-04 (새로운 기능 개발 UI/UX 원칙 추가, CSV 임포트 기능 추가, 계약호실 기능 추가)
