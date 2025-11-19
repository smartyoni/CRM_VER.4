import React, { useState, useEffect } from 'react';

const ContractDetailPanel = ({
  selectedContract,
  onClose,
  onEditContract,
  onUpdateContract,
  onDeleteContract
}) => {
  const [progressStatus, setProgressStatus] = useState(selectedContract?.progressStatus || '');

  useEffect(() => {
    setProgressStatus(selectedContract?.progressStatus || '');
  }, [selectedContract]);

  if (!selectedContract) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('ko-KR');
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return `${Number(price).toLocaleString()} 원`;
  };

  const handleProgressStatusChange = (newStatus) => {
    setProgressStatus(newStatus);
    const updatedContract = {
      ...selectedContract,
      progressStatus: newStatus
    };
    onUpdateContract(updatedContract);
  };

  return (
    <aside className="detail-panel open" style={{ position: 'fixed', right: 0, top: 0, height: '100vh', borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', overflow: 'hidden', zIndex: 50, boxShadow: '-2px 0 8px rgba(0,0,0,0.1)' }}>
      {/* 헤더 */}
      <div className="panel-header" style={{ padding: '20px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            {selectedContract.buildingName && selectedContract.roomName
              ? `${selectedContract.buildingName} ${selectedContract.roomName}`
              : '계약호실'}
          </h3>
          <p style={{ fontSize: '13px', color: '#999', margin: '4px 0 0 0' }}>
            접수일자: {selectedContract.createdAt ? selectedContract.createdAt.slice(0, 10) : '-'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => onEditContract(selectedContract)}
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

      {/* 진행상황 드롭다운 */}
      <div style={{ padding: '15px 20px', borderBottom: '1px solid #e0e0e0', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select
          value={progressStatus}
          onChange={(e) => handleProgressStatusChange(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          <option value="">진행상황 선택</option>
          <option value="계약준비">계약준비</option>
          <option value="계약체결">계약체결</option>
          <option value="보증금입금">보증금입금</option>
          <option value="잔금완료">잔금완료</option>
          <option value="계약종료">계약종료</option>
        </select>
      </div>

      {/* 콘텐츠 */}
      <div className="panel-content" style={{ flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 기본 정보 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #FF6B9D' }}>
            📋 기본 정보
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
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>진행상황:</span>
              <span style={{ color: '#333' }}>{selectedContract.progressStatus || '-'}</span>
            </div>
          </div>
        </section>

        {/* 임대인 정보 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #4CAF50' }}>
            👤 임대인 정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>임대인이름:</span>
              <span style={{ color: '#333' }}>{selectedContract.landlordName || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>임대인번호:</span>
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

        {/* 임차인 정보 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #FF9800' }}>
            👥 임차인 정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>임차인이름:</span>
              <span style={{ color: '#333' }}>{selectedContract.tenantName || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>임차인번호:</span>
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

        {/* 결제 정보 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #2196F3' }}>
            💳 결제 정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>입금일:</span>
              <span style={{ color: '#333' }}>{formatDate(selectedContract.remainderPaymentDate)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>중개보수:</span>
              <span style={{ color: '#2196F3', fontWeight: 'bold' }}>{formatPrice(selectedContract.brokerageFee)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>입금상태:</span>
              <span style={{ color: '#333' }}>{selectedContract.feeStatus || '-'}</span>
            </div>
          </div>
        </section>

        {/* 메모 */}
        {selectedContract.memo && (
          <section>
            <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #9C27B0' }}>
              💬 메모
            </h4>
            <div style={{ fontSize: '13px', color: '#333', padding: '10px', backgroundColor: '#f3e5f5', borderRadius: '4px', borderLeft: '3px solid #9C27B0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.5' }}>
              {selectedContract.memo}
            </div>
          </section>
        )}
      </div>

      {/* 버튼 영역 */}
      <div className="panel-footer" style={{ padding: '15px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '10px', justifyContent: 'flex-end', backgroundColor: '#fff' }}>
        <button
          onClick={() => onEditContract(selectedContract)}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#2196F3', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          수정
        </button>
        <button
          onClick={() => onDeleteContract(selectedContract)}
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
