import React, { useState, useEffect } from 'react';
import {
  CONTRACT_PROGRESS_STATUSES,
  CONTRACT_PROPERTY_MANAGEMENT,
  CONTRACT_EXPIRY_MANAGEMENT
} from '../constants';

const ContractDetailPanel = ({ selectedContract, isOpen, onClose, onEdit, onDelete, onUpdateContract }) => {
  const [selectedProgressStatus, setSelectedProgressStatus] = useState(selectedContract?.progressStatus || '');
  const [selectedPropertyManagement, setSelectedPropertyManagement] = useState(selectedContract?.propertyManagement || '');
  const [selectedExpiryManagement, setSelectedExpiryManagement] = useState(selectedContract?.expiryManagement || '');
  const [memoEditMode, setMemoEditMode] = useState(false);
  const [editingMemo, setEditingMemo] = useState(selectedContract?.memo || '');

  useEffect(() => {
    setSelectedProgressStatus(selectedContract?.progressStatus || '');
    setSelectedPropertyManagement(selectedContract?.propertyManagement || '');
    setSelectedExpiryManagement(selectedContract?.expiryManagement || '');
    setEditingMemo(selectedContract?.memo || '');
    setMemoEditMode(false);
  }, [selectedContract]);

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

  // 드롭다운 선택 저장
  const handleSave = () => {
    const updatedContract = {
      ...selectedContract,
      progressStatus: selectedProgressStatus,
      propertyManagement: selectedPropertyManagement,
      expiryManagement: selectedExpiryManagement
    };
    onUpdateContract(updatedContract);
  };

  // 메모 더블클릭 시 편집 모드 활성화
  const handleMemoDoubleClick = () => {
    setMemoEditMode(true);
  };

  // 메모 저장
  const handleMemoSave = () => {
    const updatedContract = {
      ...selectedContract,
      memo: editingMemo
    };
    onUpdateContract(updatedContract);
    setMemoEditMode(false);
  };

  // 메모 편집 취소
  const handleMemoCancel = () => {
    setEditingMemo(selectedContract?.memo || '');
    setMemoEditMode(false);
  };

  // 메모 textarea 키 이벤트 처리
  const handleMemoKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleMemoCancel();
    } else if (e.ctrlKey && e.key === 'Enter') {
      handleMemoSave();
    }
  };

  return (
    <aside
      className="detail-panel open"
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100vh',
        borderLeft: '1px solid #e0e0e0',
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        backgroundColor: '#fff',
        overflow: 'hidden',
        zIndex: 50,
        boxShadow: '-2px 0 8px rgba(0,0,0,0.1)'
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            {selectedContract.buildingName} {selectedContract.roomName}
          </h3>
          <p style={{ fontSize: '13px', color: '#999', margin: '4px 0 0 0' }}>
            {selectedContract.tenantName || '-'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => onEdit(selectedContract)}
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

      {/* 드롭다운 선택 영역 */}
      <div style={{ padding: '15px 20px', borderBottom: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#fafafa' }}>
        {/* 진행상황 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', minWidth: '80px' }}>
            진행상황:
          </label>
          <select
            value={selectedProgressStatus}
            onChange={(e) => setSelectedProgressStatus(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}
          >
            {CONTRACT_PROGRESS_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* 매물관리 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', minWidth: '80px' }}>
            매물관리:
          </label>
          <select
            value={selectedPropertyManagement}
            onChange={(e) => setSelectedPropertyManagement(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}
          >
            <option value="">선택하세요</option>
            {CONTRACT_PROPERTY_MANAGEMENT.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* 만기관리 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', minWidth: '80px' }}>
            만기관리:
          </label>
          <select
            value={selectedExpiryManagement}
            onChange={(e) => setSelectedExpiryManagement(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}
          >
            <option value="">선택하세요</option>
            {CONTRACT_EXPIRY_MANAGEMENT.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* 저장 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            저장
          </button>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="panel-content" style={{ flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: '130px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 기본정보 섹션 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #FF6B9D' }}>
            📋 기본 정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>건물명:</span>
              <span style={{ color: '#333' }}>{selectedContract.buildingName || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>호실명:</span>
              <span style={{ color: '#333' }}>{selectedContract.roomName || '-'}</span>
            </div>
          </div>
        </section>

        {/* 날짜정보 섹션 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #FF9800' }}>
            📅 날짜정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>계약서작성일:</span>
              <span style={{ color: '#333' }}>{formatDate(selectedContract.contractDate)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>잔금일:</span>
              <span style={{ color: '#333' }}>{formatDate(selectedContract.balanceDate)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>만기일:</span>
              <span style={{ color: '#333' }}>{formatDate(selectedContract.expiryDate)}</span>
            </div>
          </div>
        </section>

        {/* 임대인정보 섹션 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #2196F3' }}>
            👤 임대인정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>이름:</span>
              <span style={{ color: '#333' }}>{selectedContract.landlordName || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>번호:</span>
              <span style={{ color: '#333' }}>
                {selectedContract.landlordPhone ? (
                  <a href={`sms:${selectedContract.landlordPhone}`} style={{ color: '#2196F3', textDecoration: 'none' }}>
                    {selectedContract.landlordPhone}
                  </a>
                ) : '-'}
              </span>
            </div>
          </div>
        </section>

        {/* 임차인정보 섹션 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #9C27B0' }}>
            👥 임차인정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>이름:</span>
              <span style={{ color: '#333' }}>{selectedContract.tenantName || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>번호:</span>
              <span style={{ color: '#333' }}>
                {selectedContract.tenantPhone ? (
                  <a href={`sms:${selectedContract.tenantPhone}`} style={{ color: '#2196F3', textDecoration: 'none' }}>
                    {selectedContract.tenantPhone}
                  </a>
                ) : '-'}
              </span>
            </div>
          </div>
        </section>

        {/* 추가정보 섹션 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #607D8B' }}>
            ℹ️ 추가 정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>등록일:</span>
              <span style={{ color: '#333' }}>{selectedContract.createdAt ? formatDate(selectedContract.createdAt.split('T')[0]) : '-'}</span>
            </div>
          </div>
        </section>

        {/* 메모 섹션 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #9C27B0' }}>
            📝 메모
          </h4>
          {!memoEditMode ? (
            // 읽기 모드
            <div
              onDoubleClick={handleMemoDoubleClick}
              style={{
                fontSize: '13px',
                color: editingMemo ? '#333' : '#999',
                padding: '10px',
                backgroundColor: '#f3e5f5',
                borderRadius: '4px',
                borderLeft: '3px solid #9C27B0',
                minHeight: '80px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: '1.5',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              {editingMemo || '더블클릭하여 메모 추가'}
            </div>
          ) : (
            // 편집 모드
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea
                value={editingMemo}
                onChange={(e) => setEditingMemo(e.target.value)}
                onKeyDown={handleMemoKeyDown}
                autoFocus
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '10px',
                  border: '2px solid #9C27B0',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  lineHeight: '1.5',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleMemoCancel}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleMemoSave}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    backgroundColor: '#9C27B0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  저장
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 버튼 영역 */}
      <div className="panel-footer" style={{ padding: '15px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '10px', justifyContent: 'flex-end', backgroundColor: '#fff' }}>
        <button
          onClick={() => onEdit(selectedContract)}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#2196F3', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          수정
        </button>
        <button
          onClick={() => onDelete(selectedContract)}
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          삭제
        </button>
      </div>
    </aside>
  );
};

export default ContractDetailPanel;
