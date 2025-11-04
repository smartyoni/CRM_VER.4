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

## 확인 날짜
- 작성: 2025-10-20
- 최종 업데이트: 2025-11-04 (새로운 기능 개발 UI/UX 원칙 추가)
