import React, { useState, useEffect } from 'react';

const PropertyDetailPanel = ({
  selectedProperty,
  onClose,
  onEditProperty,
  onUpdateProperty,
  onDeleteProperty
}) => {
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingData, setEditingData] = useState(null);

  useEffect(() => {
    if (selectedProperty) {
      setEditingData(selectedProperty);
    }
  }, [selectedProperty]);

  if (!selectedProperty) return null;

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return `${Number(price).toLocaleString()} 만원`;
  };

  const handleFieldDoubleClick = (fieldName, value) => {
    setEditingField(fieldName);
    setEditingValue(value || '');
  };

  const handleSaveField = async () => {
    if (editingField && editingData) {
      const updatedData = { ...editingData, [editingField]: editingValue };
      setEditingData(updatedData);
      await onUpdateProperty(updatedData);
      setEditingField(null);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditingValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveField();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // 필드 렌더링 헬퍼 함수
  const renderEditableField = (fieldName, displayName, value, type = 'text', options = {}) => {
    const isEditing = editingField === fieldName;
    const displayValue =
      fieldName === 'price' ? formatPrice(value) :
      (fieldName === 'createdAt' || fieldName === 'moveInDate') ?
        (value ? value.slice(0, 10) : '-') :
      (value || '-');

    return (
      <div
        style={{
          padding: '8px',
          backgroundColor: isEditing ? '#fff8f0' : '#f9f9f9',
          borderRadius: '4px',
          cursor: 'pointer',
          border: isEditing ? '1px solid #ff1493' : '1px solid transparent',
          transition: 'all 0.2s ease'
        }}
        onDoubleClick={() => handleFieldDoubleClick(fieldName, value)}
      >
        <span style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
          {displayName}
        </span>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '4px' }}>
            {type === 'textarea' ? (
              <textarea
                autoFocus
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveField}
                style={{
                  flex: 1,
                  padding: '6px',
                  border: '1px solid #ff1493',
                  borderRadius: '3px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  minHeight: '60px',
                  resize: 'vertical'
                }}
              />
            ) : (
              <input
                autoFocus
                type={type}
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveField}
                style={{
                  flex: 1,
                  padding: '6px',
                  border: '1px solid #ff1493',
                  borderRadius: '3px',
                  fontSize: '13px',
                  fontFamily: 'inherit'
                }}
              />
            )}
            <button
              onClick={handleSaveField}
              style={{
                padding: '4px 8px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ✓
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: '4px 8px',
                backgroundColor: '#999',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px', color: fieldName === 'price' ? '#2196F3' : '#333' }}>
            {displayValue}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="customer-detail-panel" style={{
      position: 'fixed',
      right: 0,
      top: 0,
      height: '100vh',
      width: '800px',
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
        <div style={{ fontSize: '12px', color: '#999', marginBottom: '15px', fontStyle: 'italic' }}>
          💡 필드를 더블클릭하여 편집할 수 있습니다
        </div>

        {/* 기본 정보 섹션 */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#ff1493', fontSize: '14px', fontWeight: 'bold' }}>
            기본 정보
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {renderEditableField('roomNumber', '호실명', editingData?.roomNumber)}
            {renderEditableField('price', '금액', editingData?.price, 'number')}
            {renderEditableField('createdAt', '접수일', editingData?.createdAt, 'date')}
            {renderEditableField('moveInDate', '입주일', editingData?.moveInDate, 'date')}
          </div>
        </div>

        {/* 소유자 정보 섹션 */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#ff1493', fontSize: '14px', fontWeight: 'bold' }}>
            소유자 정보
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {renderEditableField('ownerName', '소유자', editingData?.ownerName)}
            {renderEditableField('ownerPhone', '소유자번호', editingData?.ownerPhone, 'tel')}
          </div>
        </div>

        {/* 기타 정보 */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#ff1493', fontSize: '14px', fontWeight: 'bold' }}>
            기타 정보
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            {renderEditableField('leaseInfo', '임대차정보', editingData?.leaseInfo)}
            {renderEditableField('tenantPhone', '점주번호', editingData?.tenantPhone, 'tel')}
          </div>
          <div style={{ marginBottom: '12px' }}>
            {renderEditableField('memo', '메모', editingData?.memo, 'textarea')}
          </div>
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
          모달 수정
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
