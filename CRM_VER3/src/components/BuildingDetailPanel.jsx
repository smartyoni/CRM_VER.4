import React, { useState, useEffect } from 'react';
import { BUILDING_TYPES, BUILDING_LOCATIONS } from '../constants';

const BuildingDetailPanel = ({ selectedBuilding, onClose, onEdit, onDelete, onUpdateBuilding }) => {
  const [selectedType, setSelectedType] = useState(selectedBuilding?.type || '');
  const [selectedLocation, setSelectedLocation] = useState(selectedBuilding?.location || '');

  useEffect(() => {
    setSelectedType(selectedBuilding?.type || '');
    setSelectedLocation(selectedBuilding?.location || '');
  }, [selectedBuilding]);

  if (!selectedBuilding) return null;

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const handleSave = () => {
    const updatedBuilding = {
      ...selectedBuilding,
      type: selectedType,
      location: selectedLocation
    };
    onUpdateBuilding(updatedBuilding);
  };

  return (
    <aside className="detail-panel open" style={{ position: 'fixed', right: 0, top: 0, height: '100vh', borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', overflow: 'hidden', zIndex: 50, boxShadow: '-2px 0 8px rgba(0,0,0,0.1)' }}>
      <div className="panel-header" style={{ padding: '20px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>건물 상세</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => onEdit(selectedBuilding)}
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
          value={selectedType}
          onChange={(e) => handleTypeChange(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          <option value="">유형 선택</option>
          {BUILDING_TYPES.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={selectedLocation}
          onChange={(e) => handleLocationChange(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          <option value="">위치 선택</option>
          {BUILDING_LOCATIONS.map(location => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>

        <button
          onClick={handleSave}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap', marginLeft: 'auto' }}
        >
          저장
        </button>
      </div>

      <div className="panel-content" style={{ flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 기본 정보 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #2196F3' }}>
            📋 기본 정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>건물명:</span>
              <span style={{ color: '#333' }}>{selectedBuilding.name || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>지번:</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#333', wordBreak: 'break-word', flex: 1 }}>{selectedBuilding.address || '-'}</span>
                {selectedBuilding.address && (
                  <a
                    href={`https://map.kakao.com/link/search/${encodeURIComponent(selectedBuilding.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      backgroundColor: '#FEE500',
                      color: '#000',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    🗺️ 지도보기
                  </a>
                )}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>위치:</span>
              <span style={{ color: '#333' }}>{selectedBuilding.location || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>유형:</span>
              <span style={{ color: '#333' }}>{selectedBuilding.type || '-'}</span>
            </div>
          </div>
        </section>

        {/* 건물 사양 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #FF6B9D' }}>
            🏗️ 건물 사양
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>사용승인일:</span>
              <span style={{ color: '#333' }}>{selectedBuilding.approvalDate || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>층수:</span>
              <span style={{ color: '#333' }}>{selectedBuilding.floors ? `${selectedBuilding.floors}층` : '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>주차:</span>
              <span style={{ color: '#333' }}>{selectedBuilding.parking ? `${selectedBuilding.parking}대` : '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>세대수:</span>
              <span style={{ color: '#333' }}>{selectedBuilding.units ? `${selectedBuilding.units}세대` : '-'}</span>
            </div>
          </div>
        </section>

        {/* 연락처 정보 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #4CAF50' }}>
            📞 연락처 정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>공동현관비번:</span>
              <span style={{ color: '#333' }}>{selectedBuilding.entrance || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>관리실번호:</span>
              <span style={{ color: '#333' }}>
                {selectedBuilding.office ? (
                  <a href={`sms:${selectedBuilding.office}`} style={{ color: '#2196F3', textDecoration: 'none' }}>
                    {selectedBuilding.office}
                  </a>
                ) : '-'}
              </span>
            </div>
          </div>
        </section>

        {/* 메모 */}
        {selectedBuilding.memo && (
          <section>
            <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #FF9800' }}>
              📝 메모
            </h4>
            <div style={{ fontSize: '13px', color: '#333', padding: '10px', backgroundColor: '#fff9e6', borderRadius: '4px', borderLeft: '3px solid #FF9800', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.5' }}>
              {selectedBuilding.memo}
            </div>
          </section>
        )}
      </div>

      {/* 버튼 영역 */}
      <div className="panel-footer" style={{ padding: '15px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '10px', justifyContent: 'flex-end', backgroundColor: '#fff' }}>
        <button
          onClick={() => onEdit(selectedBuilding)}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#2196F3', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          수정
        </button>
        <button
          onClick={() => onDelete(selectedBuilding)}
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          삭제
        </button>
      </div>
    </aside>
  );
};

export default BuildingDetailPanel;
