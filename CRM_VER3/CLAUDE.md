# Claude Code 작업 규칙

## 중요 규칙

### Git Push - 매우 중요 ⚠️
**절대 규칙: 사용자의 명시적 요청 없이 커밋이나 푸시를 하면 안 됨**

- **원칙**:
  - ✅ **커밋**: 코드 수정 완료 후 사용자 요청 시에만 `git add` 및 `git commit` 실행
  - ✅ **푸시**: 사용자가 명시적으로 "푸쉬해줘", "푸시해줘", "푸시", "푸쉬" 등으로 요청할 때만 `git push` 실행
  - ❌ **자동 커밋 금지**: 코드 수정을 완료했다고 해서 자동으로 커밋하지 말 것
  - ❌ **자동 푸시 금지**: 어떤 상황에서도 사용자 요청 없이 푸시하지 말 것

- **절차** (사용자가 요청했을 때만):
  1. 코드 수정 완료 후 대기 (자동으로 커밋하지 않음)
  2. 사용자가 요청하면 `git add` 및 `git commit` 실행
  3. 커밋 메시지에 "🤖 Generated with Claude Code"와 "Co-Authored-By: Claude <noreply@anthropic.com>" 포함
  4. 커밋 완료 후 대기 (자동으로 푸시하지 않음)
  5. 사용자가 요청하면 `git push` 실행

- **주의사항**:
  - 코드 수정이 완료되어도 사용자가 요청할 때까지 커밋하지 말 것
  - 커밋이 완료되어도 사용자가 요청할 때까지 푸시하지 말 것
  - 항상 사용자의 명시적인 말로 "푸쉬해줘", "푸시해줘", "커밋해줘" 등 확인 후 실행

### 연락처 파싱 규칙
- **우선순위**: 02- (서울) > 핸드폰 (010-) > 기타 지역번호
- **제외 대상**: 팩스번호, 관리소전화 (관리소, 관리팀, 관리사무소 라벨)
- **추출 위치**: 공인중개사사무소 또는 중개법인 뒤의 5개 라인 범위 내
- **관리소전화 무시**: "관리소", "관리팀", "관리사무소" 라벨이 있는 번호는 제외

### 부동산명 추출 규칙
- **1차**: 공인중개사 + 사무소 패턴
- **2차**: 중개법인 패턴
- 둘 다 매칭되지 않으면 부동산명 미추출

### 시간 기반 컬럼 자동 입력 규칙
- **목적**: 접수일, 기록일시 등 "언제 작성되었는지를 기록하는 컬럼"은 자동으로 현재 시간을 기록
- **규칙**:
  - **접수일** (예: `createdAt`): `YYYY-MM-DD` 형식 (월 일만 기록)
    ```javascript
    const createdAt = new Date().toISOString().split('T')[0]; // 예: 2025-11-20
    ```
  - **기록일시** (예: `recordedAt`, `loggedAt`): `YYYY-MM-DD HH:MM` 형식 (초 제외, 시간과 분까지만)
    ```javascript
    const now = new Date();
    const recordedAt = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    // 예: 2025-11-20 14:35
    ```
- **적용 범위**:
  - 모든 테이블 (고객, 매물, 건물, 계약, 일지 등)에 공통 적용
  - 신규 행 추가 시 자동으로 현재 시간 입력
  - 사용자 수정 불가 (읽기 전용)
- **컬럼명 패턴**:
  - `createdAt`, `created_at`: 접수일 (날짜만)
  - `recordedAt`, `recorded_at`, `loggedAt`, `logged_at`: 기록일시 (날짜+시간)

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

### 원칙 3: 테이블뷰 형식은 모든 기능에서 동일하게 통일 (2025-11-19 표준화 완료)

#### 헤더 스타일
- 배경색: `#689f38` (다크 라임 그린 - 검정이 섞인 녹색)
- 글자색: `white`
- 폰트 굵기: `bold`
- 패딩: `12px`
- CSS 클래스: `.customer-table thead th`
- **적용 대상**: CustomerTable, PropertyTable, BuildingTable, ContractTable, DynamicTableView

#### 셀 스타일
- 기본 폰트 크기: `14px` (CSS에서 상속)
- 패딩: `12px`
- 테두리: `1px solid #e0e0e0`
- CSS 클래스: `.customer-table td`

#### 행 색상 (교차색상)
- 짝수 행: `#ffffff` (흰색)
- 홀수 행: `#f5f5f5` (밝은 회색)
- 선택된 행: `#e3f2fd` (밝은 파란색)
- 호버 상태: `#dcfce7` (연한 초록색)

#### 테이블 기능 (필수)
- **검색바**: 상단에 위치, 초기화 버튼 포함
  - 드롭다운 필터 없음 (매물장, 건물정보에서 제거됨)
  - 필터는 좌측 사이드바(FilterSidebar)에서만 관리
- **정렬**: 헤더 클릭 시 정렬 가능
  - 기본 정렬 방향: `desc` (최신순)
  - 정렬 아이콘: `▲` (오름차순) / `▼` (내림차순)
  - TableHeader 컴포넌트로 구현 (flex layout, gap: 4px)
- **컨텍스트 메뉴**: 우클릭 시 수정/삭제 옵션
  - 백드롭 포함 (zIndex: 998)
  - 메뉴 zIndex: 999
  - 버튼 기반 구현 (padding: 10px 16px)
  - 호버 색상: 수정(#f5f5f5), 삭제(#ffebee)
- **빈 상태**: `"{searchTerm ? '검색 결과가 없습니다' : '등록된 {Entity}가 없습니다'}"`

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
- **위치**: 화면 오른쪽에 고정된 패널
  - **데스크톱 너비**: `856px` (CSS: `.detail-panel.open { width: 856px; }`)
  - 모든 테이블의 상세패널은 856px로 통일
  - 모바일: 전체 화면 차지 (`width: 100vw !important`)

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

## DetailPanel 구현 가이드 (BuildingTable 기준)

### 개요

모든 테이블에는 **우측 슬라이드 사이드바 형태의 상세 패널(DetailPanel)**이 필요합니다. BuildingTable + BuildingDetailPanel의 구조를 기준으로, 신규 테이블 추가 시 일관된 방식으로 구현해야 합니다.

### 건물정보 테이블 구조 분석

BuildingTable과 BuildingDetailPanel이 어떻게 연동되는지 이해하는 것이 중요합니다.

#### BuildingTable.jsx의 핵심 구조

**필수 Props:**
```javascript
const BuildingTable = ({
  buildings,              // 데이터 배열
  onSelectBuilding,      // 행 클릭 시 호출 (선택된 건물 전달)
  onEdit,                // 수정 버튼 클릭 시 호출
  onDelete,              // 삭제 버튼 클릭 시 호출
  selectedBuildingId,    // 현재 선택된 건물 ID (선택 행 하이라이팅용)
  onCloseDetailPanel     // 상세패널 닫기 (검색 입력 시 호출)
})
```

**필수 State:**
```javascript
const [searchTerm, setSearchTerm] = useState('');
const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'desc' });
const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, selectedBuilding: null });
```

**행 클릭 이벤트:**
```javascript
<tr
  key={building.id}
  onClick={() => onSelectBuilding(building)}  // 중요: 선택된 항목을 부모에 전달
  style={{
    backgroundColor: selectedBuildingId === building.id ? '#e3f2fd' : ...,  // 선택 상태 스타일
    cursor: 'pointer'
  }}
/>
```

**검색 입력 포커스 시:**
```javascript
<input
  onFocus={() => onCloseDetailPanel && onCloseDetailPanel()}  // UX: 검색 시 상세패널 자동 닫기
/>
```

#### BuildingDetailPanel.jsx의 핵심 구조

**필수 Props:**
```javascript
const BuildingDetailPanel = ({
  selectedBuilding,       // 선택된 건물 객체
  onClose,               // X 버튼 클릭 시 호출
  onEdit,                // 수정 버튼 클릭 시 호출
  onDelete,              // 삭제 버튼 클릭 시 호출
  onUpdateBuilding       // 즉시 업데이트 (드롭다운 선택 시)
})
```

**필수 구조:**
```javascript
// 1. Guard clause (선택된 항목이 없으면 렌더링 안 함)
if (!selectedBuilding) return null;

// 2. Layout (고정 3개 영역)
<aside className="detail-panel open">
  {/* 헤더 - 제목, 버튼, 닫기 */}
  <div className="panel-header">
    <h3>건물 상세</h3>
    <button onClick={() => onEdit(selectedBuilding)}>수정</button>
    <button onClick={onClose}>×</button>
  </div>

  {/* 콘텐츠 - 정보 표시 (섹션 분리) */}
  <div className="panel-content">
    <section>
      <h4>📋 기본 정보</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
        <span>건물명:</span>
        <span>{selectedBuilding.name || '-'}</span>
      </div>
      {/* 각 필드별 표시 */}
    </section>
  </div>

  {/* 푸터 - 액션 버튼 */}
  <div className="panel-footer">
    <button onClick={() => onEdit(selectedBuilding)}>수정</button>
    <button onClick={() => onDelete(selectedBuilding)}>삭제</button>
  </div>
</aside>
```

**CSS 클래스:**
```javascript
// 위치와 크기
className="detail-panel open"
style={{
  position: 'fixed',
  right: 0,
  top: 0,
  height: '100vh',
  width: '972px',      // 고정 너비
  borderLeft: '1px solid #e0e0e0',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 50
}}

// 콘텐츠 영역 (스크롤 가능)
className="panel-content"
style={{
  flex: 1,
  overflowY: 'auto',  // 중요: 내용만 스크롤
  padding: '20px'
}}
```

#### App.jsx에서의 연결 방식

**상태 변수 추가:**
```javascript
const [selectedBuildingId, setSelectedBuildingId] = useState(null);
const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
const [editingBuilding, setEditingBuilding] = useState(null);
```

**Computed property (선택된 항목 찾기):**
```javascript
const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
```

**핸들러 함수:**
```javascript
// 항목 선택
const handleSelectBuilding = (building) => {
  setSelectedBuildingId(building.id);
};

// 수정 모달 열기
const handleOpenBuildingModal = (building = null) => {
  setEditingBuilding(building);
  setIsBuildingModalOpen(true);
};

// 저장
const handleSaveBuilding = async (building) => {
  await saveBuilding(building);
  setIsBuildingModalOpen(false);
  setEditingBuilding(null);
  setSelectedBuildingId(building.id);  // 저장 후 선택 유지
};

// 삭제
const handleDeleteBuilding = async (building) => {
  if (window.confirm('정말 삭제하시겠습니까?')) {
    await deleteBuilding(building.id);
    setSelectedBuildingId(null);  // 삭제 후 선택 해제
  }
};

// 상세패널 닫기
const handleCloseDetailPanel = () => {
  setSelectedBuildingId(null);
};
```

**렌더링:**
```javascript
{activeTab === '건물정보' && (
  <>
    {/* DetailPanel */}
    <BuildingDetailPanel
      selectedBuilding={buildings.find(b => b.id === selectedBuildingId)}
      onClose={() => setSelectedBuildingId(null)}
      onEdit={handleOpenBuildingModal}
      onDelete={handleDeleteBuilding}
      onUpdateBuilding={handleSaveBuilding}
    />

    {/* Modal (별도 렌더링) */}
    <BuildingModal
      isOpen={isBuildingModalOpen}
      onClose={() => setIsBuildingModalOpen(false)}
      onSave={handleSaveBuilding}
      building={editingBuilding}
    />
  </>
)}
```

### 신규 테이블 추가 시 단계별 적용 방법

#### 1단계: {Entity}Table.jsx 수정

기존 테이블 컴포넌트에 다음을 추가합니다:

**Props 추가:**
```javascript
const {Entity}Table = ({
  items,
  onSelect{Entity},        // ← 추가: 항목 선택 핸들러
  onEdit,
  onDelete,
  selected{Entity}Id,      // ← 추가: 선택된 항목 ID
  onCloseDetailPanel       // ← 추가: 패널 닫기
}) => {
  // ...
}
```

**행 클릭 추가:**
```javascript
<tr
  onClick={() => onSelect{Entity}(item)}
  style={{
    backgroundColor: selected{Entity}Id === item.id ? '#e3f2fd' : (index % 2 === 0 ? '#ffffff' : '#f5f5f5'),
    cursor: 'pointer'
  }}
/>
```

**검색 입력 수정:**
```javascript
<input
  onFocus={() => onCloseDetailPanel && onCloseDetailPanel()}
/>
```

#### 2단계: {Entity}DetailPanel.jsx 생성

BuildingDetailPanel을 템플릿으로 사용하여 새 파일을 생성합니다.

**기본 템플릿:**
```javascript
import React, { useState, useEffect } from 'react';

const {Entity}DetailPanel = ({
  selected{Entity},
  onClose,
  onEdit,
  onDelete,
  onUpdate{Entity}
}) => {
  // Guard clause
  if (!selected{Entity}) return null;

  return (
    <aside className="detail-panel open" style={{
      position: 'fixed', right: 0, top: 0, height: '100vh',
      borderLeft: '1px solid #e0e0e0', display: 'flex',
      flexDirection: 'column', backgroundColor: '#fff',
      overflow: 'hidden', zIndex: 50
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '20px', borderBottom: '1px solid #e0e0e0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          {/* 항목명 표시 */}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', fontSize: '24px',
            cursor: 'pointer', padding: 0
          }}
        >
          ×
        </button>
      </div>

      {/* 콘텐츠 */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px',
        display: 'flex', flexDirection: 'column', gap: '20px'
      }}>
        <section>
          <h4 style={{
            fontSize: '13px', fontWeight: '600', color: '#666',
            marginBottom: '10px', paddingBottom: '8px',
            borderBottom: '2px solid #2196F3'
          }}>
            📋 기본 정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>필드명:</span>
              <span style={{ color: '#333' }}>{selected{Entity}.fieldName || '-'}</span>
            </div>
            {/* 각 필드별 표시 */}
          </div>
        </section>
      </div>

      {/* 푸터 */}
      <div style={{
        padding: '15px', borderTop: '1px solid #e0e0e0',
        display: 'flex', gap: '10px', justifyContent: 'flex-end'
      }}>
        <button
          onClick={() => onEdit(selected{Entity})}
          style={{
            padding: '8px 16px', fontSize: '13px',
            backgroundColor: '#2196F3', color: 'white',
            border: 'none', cursor: 'pointer', borderRadius: '4px'
          }}
        >
          수정
        </button>
        <button
          onClick={() => onDelete(selected{Entity})}
          style={{
            padding: '8px 16px', fontSize: '13px',
            backgroundColor: '#f44336', color: 'white',
            border: 'none', cursor: 'pointer', borderRadius: '4px'
          }}
        >
          삭제
        </button>
      </div>
    </aside>
  );
};

export default {Entity}DetailPanel;
```

#### 3단계: App.jsx에 상태 및 핸들러 추가

```javascript
// 상태 변수 추가
const [selected{Entity}Id, setSelected{Entity}Id] = useState(null);
const [is{Entity}ModalOpen, setIs{Entity}ModalOpen] = useState(false);
const [editing{Entity}, setEditing{Entity}] = useState(null);

// Computed property
const selected{Entity} = {entities}.find(e => e.id === selected{Entity}Id);

// 핸들러 함수
const handleSelect{Entity} = (item) => {
  setSelected{Entity}Id(item.id);
};

const handleOpen{Entity}Modal = (item = null) => {
  setEditing{Entity}(item);
  setIs{Entity}ModalOpen(true);
};

const handleSave{Entity} = async (item) => {
  await save{Entity}(item);
  setIs{Entity}ModalOpen(false);
  setEditing{Entity}(null);
  setSelected{Entity}Id(item.id);
};

const handleDelete{Entity} = async (item) => {
  if (window.confirm('정말 삭제하시겠습니까?')) {
    await delete{Entity}(item.id);
    setSelected{Entity}Id(null);
  }
};

const handleClose{Entity}DetailPanel = () => {
  setSelected{Entity}Id(null);
};
```

#### 4단계: 테이블과 DetailPanel 렌더링

```javascript
{activeTab === '{tab_name}' && (
  <>
    {/* DetailPanel */}
    <{Entity}DetailPanel
      selected{Entity}={entities.find(e => e.id === selected{Entity}Id)}
      onClose={() => setSelected{Entity}Id(null)}
      onEdit={handleOpen{Entity}Modal}
      onDelete={handleDelete{Entity}}
      onUpdate{Entity}={handleSave{Entity}}
    />

    {/* Table (main content에 렌더링) */}
    <{Entity}Table
      items={items}
      onSelect{Entity}={handleSelect{Entity}}
      onEdit={handleOpen{Entity}Modal}
      onDelete={handleDelete{Entity}}
      selected{Entity}Id={selected{Entity}Id}
      onCloseDetailPanel={handleClose{Entity}DetailPanel}
    />

    {/* Modal */}
    <{Entity}Modal
      isOpen={is{Entity}ModalOpen}
      onClose={() => setIs{Entity}ModalOpen(false)}
      onSave={handleSave{Entity}}
      item={editing{Entity}}
    />
  </>
)}
```

### 주요 체크리스트

신규 테이블에 DetailPanel 추가 시 확인사항:

- [ ] {Entity}Table.jsx에 `selected{Entity}Id`, `onSelect{Entity}`, `onCloseDetailPanel` props 추가
- [ ] {Entity}Table의 행 클릭 이벤트에 `onSelect{Entity}(item)` 호출 추가
- [ ] {Entity}Table의 검색 입력에 `onFocus={() => onCloseDetailPanel()}` 추가
- [ ] {Entity}DetailPanel.jsx 신규 생성 (BuildingDetailPanel 템플릿 기반)
- [ ] 선택된 항목이 없을 때 null 반환 (`if (!selected{Entity}) return null`)
- [ ] 헤더에 제목 + 닫기(×) 버튼 포함
- [ ] 콘텐츠에 정보 섹션 표시 (grid layout 사용)
- [ ] 푸터에 수정/삭제 버튼 포함
- [ ] App.jsx에 상태 변수 추가 (selected{Entity}Id 등)
- [ ] App.jsx에 핸들러 함수 추가 (handleSelect{Entity}, handleSave{Entity} 등)
- [ ] activeTab 조건 내에 DetailPanel과 Table 렌더링
- [ ] 저장 후 선택 ID 유지 (UX 개선)
- [ ] 삭제 후 선택 해제 (패널 자동 닫힘)

## 동적 테이블 (Dynamic Table) 구현 가이드

### 개요

동적 테이블은 사용자가 런타임에 테이블 구조를 정의하고 데이터를 관리할 수 있는 기능입니다. 정적 테이블(CustomerTable, PropertyTable 등)과 달리 컬럼 정보(tableMetadata)를 기반으로 UI를 자동 생성합니다.

### 상세패널 너비 표준
- **데스크톱**: `856px` (모든 테이블 통일)
- **반응형 (1024px 이하)**: `500px`
- **모바일 (768px 이하)**: `100vw` (전체 화면)
- **코드 예시**:
  ```javascript
  <aside className="detail-panel open" style={{
    width: '856px',  // 데스크톱 표준 너비
    // ... 기타 스타일
  }}>
  ```

### 1. DynamicTableView.jsx 상세패널 구조

#### 핵심 특징: 인라인 수정 모드 (BuildingDetailPanel과의 주요 차이점)

- **BuildingDetailPanel**: 별도 Modal을 통한 수정
- **DynamicTableView**: 상세패널 내에서 직접 수정 (isEditing 상태 사용)

#### 상태 관리

```javascript
const [isEditing, setIsEditing] = useState(false);        // 수정 모드 여부
const [editingValues, setEditingValues] = useState({});   // 수정 중인 값
```

#### 수정 기능 동작 흐름

```javascript
// 1. 선택된 행이 변경되면 editingValues 초기화
React.useEffect(() => {
  if (selectedRow) {
    setEditingValues({ ...selectedRow });
    setIsEditing(false);
  }
}, [selectedRow?.id]);

// 2. 수정 모드 진입
const handleStartEditing = () => {
  if (selectedRow) {
    setEditingValues({ ...selectedRow });
    setIsEditing(true);
  }
};

// 3. 필드 값 변경
const handleFieldChange = (fieldName, value) => {
  setEditingValues(prev => ({
    ...prev,
    [fieldName]: value
  }));
};

// 4. 수정 저장
const handleSaveEdit = () => {
  if (selectedRow) {
    onEdit(editingValues);  // 부모 컴포넌트의 핸들러 호출
    setIsEditing(false);
  }
};

// 5. 수정 취소
const handleCancelEdit = () => {
  setEditingValues({ ...selectedRow });
  setIsEditing(false);
};
```

#### BuildingDetailPanel과의 차이점 비교

| 항목 | BuildingDetailPanel | DynamicTableView |
|------|---------------------|------------------|
| **수정 방식** | 별도 Modal (BuildingModal) | 인라인 편집 (isEditing) |
| **필드 정의** | 정적 하드코딩 | tableMetadata 기반 동적 생성 |
| **드롭다운** | 건물유형/위치 필터 포함 | 없음 (순수 데이터 표시) |
| **탭** | 없음 (단일 뷰) | 없음 (단일 뷰) |
| **수정 상태** | 없음 (Modal에서 관리) | isEditing, editingValues |

### 2. DynamicRowModal.jsx 구조

#### 목적
새로운 행을 추가하기 위한 모달 (수정은 DynamicTableView 상세패널에서 처리)

#### 핵심 로직

```javascript
const DynamicRowModal = ({ isOpen, onClose, onSave, tableMetadata }) => {
  const [formData, setFormData] = useState({});

  // Guard clause
  if (!isOpen || !tableMetadata) return null;

  // 컬럼 정보 추출
  const columns = tableMetadata.columns || [];
  const displayColumns = columns.filter(col => col.display !== false);

  // 입력 값 변경 핸들러
  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // 저장 핸들러
  const handleSave = () => {
    // 시간 기반 컬럼 자동 입력
    const autoFilledData = { ...formData };

    // 컬럼 메타데이터를 순회하며 시간 기반 컬럼 감지 및 자동 입력
    displayColumns.forEach(col => {
      const colName = col.name.toLowerCase();

      // 접수일 패턴: createdAt, created_at (날짜만 YYYY-MM-DD)
      if ((colName === 'createdat' || colName === 'created_at') && !autoFilledData[col.name]) {
        const now = new Date();
        autoFilledData[col.name] = now.toISOString().split('T')[0]; // YYYY-MM-DD
      }

      // 기록일시 패턴: recordedAt, recorded_at, loggedAt, logged_at (날짜+시간 YYYY-MM-DD HH:MM)
      if ((colName === 'recordedat' || colName === 'recorded_at' ||
           colName === 'loggedat' || colName === 'logged_at') && !autoFilledData[col.name]) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        autoFilledData[col.name] = `${year}-${month}-${date} ${hours}:${minutes}`; // YYYY-MM-DD HH:MM
      }
    });

    // ID와 createdAt은 자동 생성
    const newRow = {
      id: `row_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...autoFilledData  // 자동으로 입력된 필드 포함
    };

    onSave(newRow);
    setFormData({});  // 폼 초기화
  };
};
```

#### 시간 기반 컬럼 자동 입력 메커니즘

**모달이 열릴 때 자동 초기화되는 방식:**

행 추가 모달(`DynamicRowModal`)이 열릴 때, 시간 기반 컬럼이 자동으로 현재 시간으로 채워집니다:

| 감지 방식 | 형식 | 예시 | 설명 |
|----------|------|------|------|
| **한글 키워드** | `YYYY-MM-DD HH:MM` | `2025-11-20 14:35` | "기록", "일시", "로그" 등 포함 |
| **영문 정확 매칭** | `YYYY-MM-DD HH:MM` | `2025-11-20 14:35` | recordedAt, loggedAt 등 |

**자동 입력 감지 로직 (DynamicRowModal.jsx):**

```javascript
// 컴포넌트 구조 (React Hooks 규칙 준수)
const DynamicRowModal = ({ isOpen, onClose, onSave, tableMetadata }) => {
  // 1단계: State 선언 (Hook 순서 고정)
  const [formData, setFormData] = useState({});

  // 2단계: useEffect 선언 (Hook 규칙: early return 전에 선언)
  useEffect(() => {
    if (isOpen && tableMetadata) {
      // 모달 열릴 때만 실행
      const columns = tableMetadata.columns || [];
      const displayColumns = columns.filter(col => col.display !== false);
      const autoInitialData = {};

      // 현재 시간을 YYYY-MM-DD HH:MM 형식으로 포맷
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const date = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const timeString = `${year}-${month}-${date} ${hours}:${minutes}`;

      // 각 컬럼을 순회하며 시간 기반 컬럼 감지
      displayColumns.forEach(col => {
        const colName = col.name.toLowerCase();
        const colLabel = (col.label || '').toLowerCase();

        // 감지 조건:
        // 1) 컬럼명이나 라벨에 "기록", "일시", "로그" 포함
        // 2) 타입이 text 또는 undefined (자유 입력 필드)
        if ((colName.includes('기록') || colLabel.includes('기록') ||
             colName.includes('일시') || colLabel.includes('일시') ||
             colName.includes('로그') || colLabel.includes('로그')) &&
            (col.type === 'text' || !col.type)) {
          // 자동으로 현재 시간 입력
          autoInitialData[col.name] = timeString;  // "2025-11-20 14:35"
        }
      });

      // formData 상태 업데이트 (입력 필드에 자동으로 표시됨)
      setFormData(autoInitialData);
    }
  }, [isOpen, tableMetadata]);

  // 3단계: early return (조건부 렌더링)
  // ※ 중요: useEffect 이후에 위치해야 Hook 규칙 준수
  if (!isOpen || !tableMetadata) return null;

  // 4단계: 정상 렌더링
  const columns = tableMetadata.columns || [];
  const displayColumns = columns.filter(col => col.display !== false);

  // ... 나머지 로직
};
```

**작동 흐름 상세:**

1. **모달 오픈** (`isOpen = true`)
   - useEffect 의존성 배열 `[isOpen, tableMetadata]` 변경
   - useEffect 콜백 함수 실행

2. **시간 포맷팅** (YYYY-MM-DD HH:MM)
   - `new Date()` → 현재 시간 취득
   - 월/일/시/분을 2자리로 패딩 (padStart)
   - 초는 제외

3. **컬럼 감지** (forEach 순회)
   - 컬럼명/라벨을 소문자로 변환
   - "기록", "일시", "로그" 키워드 포함 확인
   - type이 text 또는 undefined 확인

4. **autoInitialData에 저장**
   - 감지된 컬럼: `autoInitialData[col.name] = timeString`
   - 예: `{ "기록일시": "2025-11-20 14:35" }`

5. **formData 상태 업데이트**
   - `setFormData(autoInitialData)`
   - React 리렌더링 트리거

6. **입력 필드 자동 표시**
   - `<input value={formData[col.name] || ''}>`
   - formData의 값이 입력 필드에 자동으로 표시됨

7. **사용자 수정 가능**
   - `onChange={(e) => handleInputChange(col.name, e.target.value)}`
   - 사용자가 값을 수정할 수 있음

**자동 입력 특징:**
- **타이밍**: 모달이 열릴 때 (isOpen이 true가 될 때)
- **감지 대상**: 컬럼명이나 라벨에 "기록", "일시", "로그" 등의 키워드 포함
- **형식**: `YYYY-MM-DD HH:MM` (월 일 시 분, 초 제외)
- **예시**: `2025-11-20 14:35`
- **수정 가능**: 입력 필드에서 사용자가 값을 수정 가능
- **모든 테이블 적용**: 동적 테이블에 공통 적용
- **React Hooks 규칙**: useState → useEffect → early return 순서 준수

#### 동적 필드 생성

tableMetadata.columns를 순회하며 각 컬럼 타입에 맞게 입력 필드 자동 생성:

```javascript
{displayColumns.map(col => (
  <div key={col.name}>
    <label>
      {col.label || col.name}
      {col.required && <span style={{ color: '#f44336' }}>*</span>}
    </label>
    <input
      type={
        col.type === 'number' ? 'number' :
        col.type === 'date' ? 'date' :
        'text'
      }
      placeholder={`${col.label || col.name}을(를) 입력하세요`}
      value={formData[col.name] || ''}
      onChange={(e) => handleInputChange(col.name, e.target.value)}
    />
  </div>
))}
```

### 3. App.jsx 연결 방식

#### 필요한 상태 변수

```javascript
// 동적 테이블 관련 상태
const [dynamicTables, setDynamicTables] = useState([]);                     // 테이블 메타데이터 목록
const [dynamicTableData, setDynamicTableData] = useState({});              // { tableId: [rows] }
const [selectedDynamicTableId, setSelectedDynamicTableId] = useState(null); // 현재 선택된 테이블
const [selectedDynamicRowId, setSelectedDynamicRowId] = useState(null);    // 현재 선택된 행
const [isTableCreatorOpen, setIsTableCreatorOpen] = useState(false);       // 테이블 생성 모달
const [isCSVImporterOpen, setIsCSVImporterOpen] = useState(false);         // CSV 임포트 모달
const [isDynamicRowModalOpen, setIsDynamicRowModalOpen] = useState(false); // 행 추가 모달

// useRef로 구독 해제 함수 관리
const dynamicTableUnsubscribes = useRef({});
```

#### 핸들러 함수들

```javascript
// 행 선택
const handleSelectDynamicRow = (row) => {
  if (selectedDynamicRowId === row.id) {
    setSelectedDynamicRowId(null);
  } else {
    setSelectedDynamicRowId(row.id);
  }
};

// 행 추가 (DynamicRowModal에서 호출)
const handleAddDynamicRow = async (newRow) => {
  try {
    await saveTableRow(activeTab, newRow);  // activeTab = tableId
    setDynamicTableData(prev => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] || []), newRow]
    }));
    setIsDynamicRowModalOpen(false);
    alert('행이 추가되었습니다.');
  } catch (error) {
    alert(`행 추가 실패: ${error.message}`);
  }
};

// 행 수정 (DynamicTableView의 onEdit 콜백)
const handleSaveDynamicRow = async (updatedRow) => {
  try {
    await saveTableRow(activeTab, updatedRow);
    setDynamicTableData(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).map(row =>
        row.id === updatedRow.id ? updatedRow : row
      )
    }));
    alert('저장되었습니다.');
  } catch (error) {
    alert(`행 저장 실패: ${error.message}`);
  }
};

// 행 삭제
const handleDeleteDynamicRow = async (row) => {
  if (!confirm('이 행을 삭제하겠습니까?')) {
    return;
  }

  try {
    await deleteTableRow(selectedDynamicTableId, row.id);
    if (selectedDynamicRowId === row.id) {
      setSelectedDynamicRowId(null);
    }
  } catch (error) {
    alert(`행 삭제 실패: ${error.message}`);
  }
};

// 테이블 삭제
const handleDeleteDynamicTable = async (tableId) => {
  if (!confirm('이 테이블과 모든 데이터를 삭제하겠습니까?')) {
    return;
  }

  try {
    await deleteTable(tableId);
    setSelectedDynamicTableId(null);
    alert('테이블이 삭제되었습니다.');
  } catch (error) {
    alert(`테이블 삭제 실패: ${error.message}`);
  }
};
```

#### DynamicTableView와 DynamicRowModal Props 연결

```javascript
{/* main content 영역 */}
{dynamicTables.some(t => t.id === activeTab) ? (
  <DynamicTableView
    tableData={dynamicTableData[activeTab] || []}
    tableMetadata={dynamicTables.find(t => t.id === activeTab)}
    onSelectRow={handleSelectDynamicRow}
    onEdit={handleSaveDynamicRow}              // 수정 저장 핸들러
    onDelete={handleDeleteDynamicRow}
    selectedRowId={selectedDynamicRowId}
    onCloseDetailPanel={handleCloseDetailPanel}
  />
) : (
  // ... 다른 테이블들
)}

{/* 행 추가 모달 */}
<DynamicRowModal
  isOpen={isDynamicRowModalOpen}
  onClose={() => setIsDynamicRowModalOpen(false)}
  onSave={handleAddDynamicRow}
  tableMetadata={dynamicTables.find(t => t.id === activeTab)}
/>
```

#### 상단 액션 버튼

```javascript
{dynamicTables.some(t => t.id === activeTab) ? (
  <>
    <button onClick={() => setIsDynamicRowModalOpen(true)} className="btn-primary">
      + 행 추가
    </button>
    <button onClick={() => setIsCSVImporterOpen(true)} className="btn-secondary">
      CSV 임포트
    </button>
    <button
      onClick={() => handleDeleteDynamicTable(activeTab)}
      className="btn-danger"
      style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none' }}
    >
      테이블 삭제
    </button>
  </>
) : (
  // ... 다른 기능의 버튼들
)}
```

#### 하단 탭바 - 동적 테이블 탭 생성

```javascript
{/* 동적 테이블 탭들 */}
{dynamicTables.map(table => (
  <button
    key={table.id}
    onClick={() => setActiveTab(table.id)}
  >
    {table.icon} {table.name}
  </button>
))}

{/* 테이블 추가 버튼 */}
<button onClick={() => setIsTableCreatorOpen(true)}>
  + 테이블 추가
</button>
```

### 4. 주요 특징과 차이점

#### 정적 테이블 vs 동적 테이블

| 항목 | 정적 테이블 (BuildingTable 등) | 동적 테이블 (DynamicTableView) |
|------|-------------------------------|-------------------------------|
| **컬럼 정의** | 코드에 하드코딩 | tableMetadata 기반 런타임 생성 |
| **추가/수정 UI** | 추가: Modal, 수정: Modal | 추가: Modal, 수정: 인라인 (상세패널) |
| **필드 구조** | 고정 (변경 시 코드 수정 필요) | 동적 (사용자가 정의) |
| **타입 지원** | 모든 React 컴포넌트 가능 | text, number, date만 지원 |
| **유효성 검사** | 커스텀 로직 가능 | 기본 HTML5 검증만 |
| **DetailPanel** | 정적 UI (섹션별 구분) | 동적 UI (컬럼 정보 기반 자동 생성) |

#### 동적 테이블만의 특징

1. **메타데이터 기반 UI 생성**
   - tableMetadata.columns를 순회하며 UI 자동 생성
   - 컬럼 타입(text/number/date)에 따라 input 타입 자동 결정
   - displayColumns 필터링으로 숨긴 컬럼 제외

2. **인라인 수정 모드**
   - 별도 Modal 없이 상세패널에서 직접 수정
   - isEditing 상태로 읽기/수정 모드 전환
   - editingValues로 임시 값 관리하여 취소 시 원본 보존

3. **유연한 데이터 구조**
   - 사용자가 런타임에 컬럼 추가/제거 가능
   - CSV 임포트로 자동 테이블 생성 지원
   - 여러 동적 테이블을 독립적으로 관리

4. **자동 ID/시간 생성**
   - 새 행 추가 시 `id: 'row_${Date.now()}'` 자동 생성
   - `createdAt: new Date().toISOString()` 자동 설정

### 5. 구현 시 주의사항

#### 필수 체크리스트

- [ ] **tableMetadata 필수 검증**: 모든 컴포넌트에서 `if (!tableMetadata) return null` 처리
- [ ] **displayColumns 필터링**: `columns.filter(col => col.display !== false)` 사용
- [ ] **타입별 렌더링**: 날짜는 toLocaleDateString(), 숫자는 toLocaleString() 사용
- [ ] **자동 ID 생성**: 새 행 추가 시 타임스탐프 기반 ID 생성
- [ ] **구독 정리**: dynamicTableUnsubscribes.current로 메모리 누수 방지
- [ ] **상태 동기화**: Firebase 저장 후 로컬 state도 즉시 업데이트
- [ ] **에러 처리**: try-catch로 Firebase 작업 실패 처리
- [ ] **확인 다이얼로그**: 삭제 작업 전 confirm() 호출

#### 성능 최적화

```javascript
// useMemo로 필터링/정렬 캐싱
const filteredAndSortedData = useMemo(() => {
  let filtered = tableData.filter(row => /* 검색 */);
  // ... 정렬 로직
  return filtered;
}, [tableData, searchTerm, sortColumn, sortOrder, displayColumns]);

// useEffect 의존성 배열 최적화
React.useEffect(() => {
  if (selectedRow) {
    setEditingValues({ ...selectedRow });
    setIsEditing(false);
  }
}, [selectedRow?.id]);  // 전체 객체 대신 id만 의존
```

#### 일관성 유지

- 모든 동적 테이블은 동일한 UI 패턴 사용 (customer-table CSS 클래스)
- 헤더 색상: `#689f38` (다크 라임 그린)
- 행 색상: 짝수 `#ffffff`, 홀수 `#f5f5f5`, 선택 `#e3f2fd`
- 호버 색상: `#dcfce7` (연한 초록색)
- 패널 너비: `972px` (모든 DetailPanel과 동일)
- 폰트 크기: 콘텐츠 `13px`, 헤더 `16px`

## 새로운 테이블 추가 시 체크리스트 (표준화 가이드)

### 테이블 컴포넌트 작성 규칙

새로운 기능의 테이블을 추가할 때 아래 표준화된 형식을 따르세요:

#### 1. 파일 구조
- [ ] `{Entity}Table.jsx` 생성
- [ ] `{Entity}Modal.jsx` 생성
- [ ] `{Entity}DetailPanel.jsx` 생성 (필요 시)
- [ ] `constants.js`에 필수 상수 추가

#### 2. {Entity}Table.jsx 구현 (필수 사항)

**Props:**
```javascript
const {EntityName}Table = ({
  items,                    // 데이터 배열
  onSelectItem,            // 행 클릭 핸들러
  onEdit,                  // 수정 핸들러
  onDelete,                // 삭제 핸들러
  selectedItemId,          // 선택된 항목 ID
  onCloseDetailPanel       // 상세패널 닫기
}) => {
  // ...
}
```

**필수 State:**
```javascript
const [searchTerm, setSearchTerm] = useState('');
const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, selectedItem: null });
const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' }); // 기본값: desc
```

**필수 구조:**
```javascript
// 1. useMemo를 사용한 필터링 및 정렬
const filteredItems = useMemo(() => {
  let filtered = items.filter(item => /* 검색 조건 */);

  const sorted = [...filtered].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    // null/undefined 처리
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // 타입별 비교 (날짜, 숫자, 문자열)
    // ...

    return sortConfig.direction === 'asc' ? 비교값 : -비교값;
  });

  return sorted;
}, [items, searchTerm, sortConfig]);

// 2. TableHeader 컴포넌트
const TableHeader = ({ label, sortKey }) => (
  <th onClick={() => handleSort(sortKey)} style={{...}}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {label}
      {sortConfig.key === sortKey && (
        <span style={{ fontSize: '12px' }}>
          {sortConfig.direction === 'asc' ? '▲' : '▼'}
        </span>
      )}
    </div>
  </th>
);

// 3. 컨텍스트 메뉴 (우클릭)
const handleContextMenu = (e, item) => {
  e.preventDefault();
  setContextMenu({ visible: true, x: e.clientX, y: e.clientY, selectedItem: item });
};

// 4. 정렬 핸들러
const handleSort = (key) => {
  setSortConfig(prev => ({
    key,
    direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
  }));
};
```

**필수 렌더링 구조:**
```javascript
return (
  <div className="property-table-container" style={{...}}>
    {/* 검색 바 - 드롭다운 없음 */}
    <div style={{ position: 'relative' }}>
      <input placeholder="..." value={searchTerm} onChange={...} />
      {searchTerm && <button onClick={() => setSearchTerm('')}>✕</button>}
    </div>

    {/* 테이블 */}
    <div style={{ flex: 1, overflowX: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
      {filteredItems.length > 0 ? (
        <table className="customer-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <TableHeader label="..." sortKey="..." />
              {/* 각 컬럼에 대해 반복 */}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, index) => (
              <tr
                key={item.id}
                onClick={() => onSelectItem(item)}
                onContextMenu={(e) => handleContextMenu(e, item)}
                style={{
                  backgroundColor: selectedItemId === item.id ? '#e3f2fd' : (index % 2 === 0 ? '#ffffff' : '#f5f5f5'),
                  cursor: 'pointer',
                  borderBottom: '1px solid #e0e0e0',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedItemId !== item.id) {
                    e.currentTarget.style.backgroundColor = '#dcfce7';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedItemId !== item.id) {
                    e.currentTarget.style.backgroundColor = (index % 2 === 0 ? '#ffffff' : '#f5f5f5');
                  }
                }}
              >
                <td style={{ padding: '12px' }}>...</td>
                {/* 각 셀에 대해 반복 */}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          {searchTerm ? '검색 결과가 없습니다' : '등록된 {Entity}가 없습니다'}
        </div>
      )}
    </div>

    {/* 컨텍스트 메뉴 */}
    {contextMenu.visible && (
      <>
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}
             onClick={() => setContextMenu({ visible: false, ... })} />
        <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x,
                      backgroundColor: '#fff', border: '1px solid #ddd', zIndex: 999, ... }}>
          <button onClick={() => { onEdit(...); ... }}>수정</button>
          <button onClick={() => { onDelete(...); ... }} style={{ color: '#d32f2f' }}>삭제</button>
        </div>
      </>
    )}
  </div>
);
```

#### 3. App.jsx 연결
- [ ] 상태 변수: `[items, setItems]`, `[selectedId, setSelectedId]`, `[isModalOpen, setIsModalOpen]`
- [ ] Firebase 구독: `subscribeTo{Entities}` 함수
- [ ] 핸들러: `handleSelect`, `handleOpenModal`, `handleCloseModal`, `handleSave`, `handleDelete`
- [ ] 탭 추가: FilterSidebar와 main content 영역에 새 탭 추가
- [ ] {Entity}Table props: **필터링 상태 변수 제거** (필터는 사이드바에서만 관리)

#### 4. FilterSidebar 연결 (필요 시)
- [ ] activeTab 조건에 새 탭 추가
- [ ] 필터 목록 추가 (getStatusCount 함수 확장)
- [ ] 필터 상태 변수 분리 (다른 기능에 영향 안 줌)
- [ ] **매물장, 건물정보는 필터 없음** (검색바만 있음)

#### 5. CSS 스타일
- [ ] 테이블 클래스: `class="customer-table"` 사용
- [ ] 헤더 배경색: CSS `.customer-table thead th`에서 `#689f38` 자동 적용
- [ ] 커스텀 색상 필요 시: 인라인 스타일 사용

#### 6. DetailPanel 구현
- [ ] 우측 슬라이드 패널 구조
- [ ] 기본정보, 활동, 메모 등 탭 구성
- [ ] 수정/삭제 액션 버튼 포함

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
- 최종 업데이트: 2025-11-20 (테이블뷰 표준화 완료 - 모든 테이블 디자인/기능 통일, 헤더색 #689f38로 변경, 검색창 드롭다운 제거, 새로운 테이블 추가 가이드 작성, 동적 테이블 상세패널 구현 가이드 추가, 상세패널 너비 856px로 통일, DynamicRowModal 기록일시 자동입력 기능 완성 - 모달 오픈시 현재 시간 자동 초기화, React Hooks 규칙 준수, 한글 컬럼명 완벽 지원)
