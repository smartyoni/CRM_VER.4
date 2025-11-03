import React from 'react';

const PropertyDetailPanel = ({
  selectedProperty,
  onClose,
  onEditProperty,
  onUpdateProperty,
  onDeleteProperty
}) => {
  if (!selectedProperty) return null;

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return `${Number(price).toLocaleString()} 만원`;
  };

  return (
    <div className="customer-detail-panel" style={{
      position: 'fixed',
      right: 0,
      top: 0,
      height: '100vh',
      width: '400px',
      backgroundColor: '#fff',
      borderLeft: '1px solid #e0e0e0',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      overflowY: 'auto'
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9f9f9'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
            {selectedProperty.buildingName}
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#7f8c8d' }}>
            {selectedProperty.category} • {selectedProperty.propertyType}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#999',
            padding: '0 10px'
          }}
        >
          ✕
        </button>
      </div>

      {/* 콘텐츠 */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {/* 기본 정보 섹션 */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#ff1493', fontSize: '14px', fontWeight: 'bold' }}>
            기본 정보
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <span style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                호실명
              </span>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px' }}>
                {selectedProperty.roomNumber || '-'}
              </p>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <span style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                금액
              </span>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px', color: '#2196F3' }}>
                {formatPrice(selectedProperty.price)}
              </p>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <span style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                접수일
              </span>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px' }}>
                {selectedProperty.createdAt ? selectedProperty.createdAt.slice(0, 10) : '-'}
              </p>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <span style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                입주일
              </span>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px' }}>
                {selectedProperty.moveInDate ? selectedProperty.moveInDate.slice(0, 10) : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* 소유자 정보 섹션 */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#ff1493', fontSize: '14px', fontWeight: 'bold' }}>
            소유자 정보
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <span style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                소유자
              </span>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px' }}>
                {selectedProperty.ownerName || '-'}
              </p>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <span style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                소유자번호
              </span>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px' }}>
                <a href={`sms:${selectedProperty.ownerPhone}`} style={{ color: '#2196F3', textDecoration: 'none' }}>
                  {selectedProperty.ownerPhone || '-'}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* 기타 정보 */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#ff1493', fontSize: '14px', fontWeight: 'bold' }}>
            기타 정보
          </h4>
          <div style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '8px' }}>
            <span style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
              임대차정보
            </span>
            <p style={{ margin: 0, fontSize: '13px', color: '#333' }}>
              {selectedProperty.leaseInfo || '-'}
            </p>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '8px' }}>
            <span style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
              점주번호
            </span>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px' }}>
              <a href={`sms:${selectedProperty.tenantPhone}`} style={{ color: '#2196F3', textDecoration: 'none' }}>
                {selectedProperty.tenantPhone || '-'}
              </a>
            </p>
          </div>
          {selectedProperty.memo && (
            <div style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <span style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                메모
              </span>
              <p style={{ margin: 0, fontSize: '13px', color: '#333', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {selectedProperty.memo}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 푸터 (버튼) */}
      <div style={{
        padding: '15px 20px',
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={onClose}
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          닫기
        </button>
        <button
          onClick={() => onEditProperty(selectedProperty)}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          수정
        </button>
        <button
          onClick={() => {
            if (confirm('이 매물을 삭제하시겠습니까?')) {
              onDeleteProperty(selectedProperty);
            }
          }}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          삭제
        </button>
      </div>
    </div>
  );
};

export default PropertyDetailPanel;
