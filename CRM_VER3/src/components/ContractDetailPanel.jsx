import React from 'react';

const ContractDetailPanel = ({ selectedContract, isOpen, onClose, onEdit, onDelete }) => {
  if (!isOpen || !selectedContract) return null;

  // 날짜를 "2025. 8. 13" 형식으로 변환
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    if (dateStr.includes('.')) return dateStr; // 이미 형식화된 경우
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}. ${month}. ${day}`;
  };

  return (
    <aside
      className="detail-panel"
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        width: '992px',
        height: '100vh',
        backgroundColor: '#fff',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        zIndex: 999,
        overflow: 'hidden'
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: '1px solid #eee'
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>
            {selectedContract.buildingName} {selectedContract.roomName}
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>
            {selectedContract.tenantName || '임차인정보없음'}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            padding: 0
          }}
        >
          ✕
        </button>
      </div>

      {/* 콘텐츠 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px'
        }}
      >
        {/* 기본정보 섹션 */}
        <section style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
            📋 기본 정보
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>건물명</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                {selectedContract.buildingName || '-'}
              </div>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>호실명</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                {selectedContract.roomName || '-'}
              </div>
            </div>
          </div>
        </section>

        {/* 진행상황 섹션 */}
        <section style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
            🔄 진행상황
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>진행상황</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                {selectedContract.progressStatus || '-'}
              </div>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>매물관리</div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}>
                {selectedContract.propertyManagement || '-'}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>만기관리</div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}>
              {selectedContract.expiryManagement || '-'}
            </div>
          </div>
        </section>

        {/* 날짜정보 섹션 */}
        <section style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
            📅 날짜정보
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>계약서작성일</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                {formatDate(selectedContract.contractDate)}
              </div>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>잔금일</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                {formatDate(selectedContract.balanceDate)}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>만기일</div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
              {formatDate(selectedContract.expiryDate)}
            </div>
          </div>
        </section>

        {/* 임대인정보 섹션 */}
        <section style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
            👤 임대인정보
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>임대인이름</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                {selectedContract.landlordName || '-'}
              </div>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>임대인번호</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                {selectedContract.landlordPhone || '-'}
              </div>
            </div>
          </div>
        </section>

        {/* 임차인정보 섹션 */}
        <section style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
            👥 임차인정보
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>임차인이름</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                {selectedContract.tenantName || '-'}
              </div>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>임차인번호</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                {selectedContract.tenantPhone || '-'}
              </div>
            </div>
          </div>
        </section>

        {/* 추가정보 섹션 */}
        <section style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
            ℹ️ 추가 정보
          </h4>
          <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>등록일</div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
              {selectedContract.createdAt ? formatDate(selectedContract.createdAt.split('T')[0]) : '-'}
            </div>
          </div>
        </section>
      </div>

      {/* 푸터 - 액션 버튼 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          padding: '20px',
          borderTop: '1px solid #eee',
          backgroundColor: '#f9f9f9'
        }}
      >
        <button
          onClick={() => onEdit(selectedContract)}
          style={{
            padding: '10px 20px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.borderColor = '#999';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.borderColor = '#ddd';
          }}
        >
          수정
        </button>
        <button
          onClick={() => onDelete(selectedContract)}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#f44336',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#d32f2f';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f44336';
          }}
        >
          삭제
        </button>
      </div>
    </aside>
  );
};

export default ContractDetailPanel;
