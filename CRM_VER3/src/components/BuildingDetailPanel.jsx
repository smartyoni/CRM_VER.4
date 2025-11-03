import React from 'react';

const BuildingDetailPanel = ({ selectedBuilding, onClose, onEdit, onDelete }) => {
  if (!selectedBuilding) return null;

  return (
    <aside className="detail-panel" style={{ width: '350px', borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', overflowY: 'auto' }}>
      <div className="panel-header" style={{ padding: '20px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>건물 상세</h3>
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

      <div className="panel-content" style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>지번:</span>
              <span style={{ color: '#333', wordBreak: 'break-word' }}>{selectedBuilding.address || '-'}</span>
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
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>공동현관:</span>
              <span style={{ color: '#333' }}>{selectedBuilding.entrance || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>관리실:</span>
              <span style={{ color: '#333' }}>{selectedBuilding.office || '-'}</span>
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
      <div className="panel-footer" style={{ padding: '15px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onEdit(selectedBuilding)}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
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
