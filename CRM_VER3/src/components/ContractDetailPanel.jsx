import React from 'react';

const ContractDetailPanel = ({ selectedContract, isOpen, onClose, onEdit, onDelete }) => {
  if (!isOpen || !selectedContract) return null;

  // 계약상태별 배경색
  const getStatusColor = (status) => {
    switch(status) {
      case '진행중': return '#e8f5e9';
      case '만료': return '#fff9c4';
      case '해지': return '#ffebee';
      default: return '#f5f5f5';
    }
  };

  // 계약상태별 텍스트 색상
  const getStatusTextColor = (status) => {
    switch(status) {
      case '진행중': return '#2e7d32';
      case '만료': return '#f57f17';
      case '해지': return '#c62828';
      default: return '#333';
    }
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
            {selectedContract.buildingName} {selectedContract.roomNumber}
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>
            {selectedContract.contractorName}
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
            {/* 건물명 */}
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>건물명</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                {selectedContract.buildingName || '-'}
              </div>
            </div>

            {/* 호실번호 */}
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>호실번호</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                {selectedContract.roomNumber || '-'}
              </div>
            </div>

            {/* 계약일 */}
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>계약일</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                {selectedContract.contractDate || '-'}
              </div>
            </div>

            {/* 계약자명 */}
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>계약자명</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                {selectedContract.contractorName || '-'}
              </div>
            </div>

            {/* 계약금액 */}
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>계약금액</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                {selectedContract.contractAmount ? `${selectedContract.contractAmount.toLocaleString()}만원` : '-'}
              </div>
            </div>

            {/* 계약상태 */}
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>계약상태</div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: getStatusTextColor(selectedContract.contractStatus),
                  backgroundColor: getStatusColor(selectedContract.contractStatus),
                  padding: '6px 12px',
                  borderRadius: '4px',
                  display: 'inline-block'
                }}
              >
                {selectedContract.contractStatus || '-'}
              </div>
            </div>
          </div>
        </section>

        {/* 메모 섹션 */}
        {selectedContract.memo && (
          <section style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
              📝 메모
            </h4>
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#333',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {selectedContract.memo}
            </div>
          </section>
        )}

        {/* 추가 정보 */}
        <section style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
            ℹ️ 추가 정보
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* 접수일 */}
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>접수일</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                {selectedContract.createdAt ? selectedContract.createdAt.split('T')[0] : '-'}
              </div>
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
