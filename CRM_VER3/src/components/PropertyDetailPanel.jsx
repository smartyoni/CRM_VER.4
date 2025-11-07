import React, { useState, useEffect } from 'react';
import { PROPERTY_TYPES, PROPERTY_CATEGORIES } from '../constants';

const PropertyDetailPanel = ({
  selectedProperty,
  onClose,
  onEditProperty,
  onUpdateProperty,
  onDeleteProperty
}) => {
  const [selectedPropertyType, setSelectedPropertyType] = useState(selectedProperty?.propertyType || '');
  const [selectedCategory, setSelectedCategory] = useState(selectedProperty?.category || '');
  const [receivedDate, setReceivedDate] = useState(selectedProperty?.createdAt?.slice(0, 10) || '');

  useEffect(() => {
    setSelectedPropertyType(selectedProperty?.propertyType || '');
    setSelectedCategory(selectedProperty?.category || '');
    setReceivedDate(selectedProperty?.createdAt?.slice(0, 10) || '');
  }, [selectedProperty]);

  if (!selectedProperty) return null;

  const formatPrice = (price) => {
    if (!price) return '-';
    return `${Number(price).toLocaleString()} 만원`;
  };

  const handlePropertyTypeChange = (type) => {
    setSelectedPropertyType(type);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSave = () => {
    const updatedProperty = {
      ...selectedProperty,
      propertyType: selectedPropertyType,
      category: selectedCategory,
      createdAt: receivedDate
    };
    onUpdateProperty(updatedProperty);
  };

  return (
    <aside className="detail-panel open" style={{ position: 'fixed', right: 0, top: 0, height: '100vh', borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', overflow: 'hidden', zIndex: 50, boxShadow: '-2px 0 8px rgba(0,0,0,0.1)' }}>
      {/* 헤더 */}
      <div className="panel-header" style={{ padding: '20px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{selectedProperty.buildingName}</h3>
          <p style={{ fontSize: '13px', color: '#999', margin: '4px 0 0 0' }}>{selectedProperty.roomNumber}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => onEditProperty(selectedProperty)}
            className="btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            수정
          </button>
          <button
            onClick={onClose}
            className="btn-close"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: 0,
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* 필터 드롭다운 */}
      <div style={{ padding: '15px 20px', borderBottom: '1px solid #e0e0e0', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={selectedPropertyType}
          onChange={(e) => handlePropertyTypeChange(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          <option value="">매물유형</option>
          {PROPERTY_TYPES.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          <option value="">구분 선택</option>
          {PROPERTY_CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={receivedDate}
          onChange={(e) => setReceivedDate(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        />

        <button
          onClick={handleSave}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap', marginLeft: 'auto' }}
        >
          저장
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="panel-content" style={{ flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 기본 정보 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #FF6B9D' }}>
            📋 기본 정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>호실명:</span>
              <span style={{ color: '#333' }}>{selectedProperty.roomNumber || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>보증금:</span>
              <span style={{ color: '#2196F3', fontWeight: 'bold' }}>{formatPrice(selectedProperty.deposit || selectedProperty.price)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>월세:</span>
              <span style={{ color: '#FF6B9D', fontWeight: 'bold' }}>{formatPrice(selectedProperty.monthlyRent)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>접수일:</span>
              <span style={{ color: '#333' }}>{selectedProperty.createdAt ? selectedProperty.createdAt.slice(0, 10) : '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>입주일:</span>
              <span style={{ color: '#333' }}>{selectedProperty.moveInDate ? selectedProperty.moveInDate.slice(0, 10) : '-'}</span>
            </div>
          </div>
        </section>

        {/* 소유자 정보 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #4CAF50' }}>
            👤 소유자 정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>소유자:</span>
              <span style={{ color: '#333' }}>{selectedProperty.ownerName || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>번호:</span>
              <span style={{ color: '#333' }}>
                {selectedProperty.ownerPhone ? (
                  <a href={`sms:${selectedProperty.ownerPhone}`} style={{ color: '#2196F3', textDecoration: 'none' }}>
                    {selectedProperty.ownerPhone}
                  </a>
                ) : '-'}
              </span>
            </div>
          </div>
        </section>

        {/* 기타 정보 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #FF9800' }}>
            📝 기타 정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>점주번호:</span>
              <span style={{ color: '#333' }}>
                {selectedProperty.tenantPhone ? (
                  <a href={`sms:${selectedProperty.tenantPhone}`} style={{ color: '#2196F3', textDecoration: 'none' }}>
                    {selectedProperty.tenantPhone}
                  </a>
                ) : '-'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>임대차:</span>
              <span style={{ color: '#333' }}>{selectedProperty.leaseInfo || '-'}</span>
            </div>
          </div>
        </section>

        {/* 메모 */}
        {selectedProperty.memo && (
          <section>
            <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #2196F3' }}>
              💬 메모
            </h4>
            <div style={{ fontSize: '13px', color: '#333', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '4px', borderLeft: '3px solid #2196F3', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.5' }}>
              {selectedProperty.memo}
            </div>
          </section>
        )}
      </div>

      {/* 버튼 영역 */}
      <div className="panel-footer" style={{ padding: '15px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '10px', justifyContent: 'flex-end', backgroundColor: '#fff' }}>
        <button
          onClick={() => onEditProperty(selectedProperty)}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#2196F3', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          수정
        </button>
        <button
          onClick={() => onDeleteProperty(selectedProperty)}
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          삭제
        </button>
      </div>
    </aside>
  );
};

export default PropertyDetailPanel;
