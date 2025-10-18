import React, { useState, useEffect } from 'react';

const BasicInfo = ({ customer, onUpdateCustomer }) => {
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoValue, setMemoValue] = useState(customer.memo || '');

  if (!customer) return null;

  // 고객이 변경될 때마다 메모 상태 초기화
  useEffect(() => {
    setMemoValue(customer.memo || '');
    setIsEditingMemo(false);
  }, [customer.id]);

  const handleSaveMemo = () => {
    onUpdateCustomer({
      ...customer,
      memo: memoValue
    });
    setIsEditingMemo(false);
  };

  const handleCancelMemo = () => {
    setMemoValue(customer.memo || '');
    setIsEditingMemo(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSaveMemo();
    } else if (e.key === 'Escape') {
      handleCancelMemo();
    }
  };

  return (
    <div className="basic-info-container">
        <div className="info-section">
            <h4>기본 정보</h4>
            <div style={{ marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '4px', fontSize: '12px' }}>고객명</span>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>{customer.name}</p>
            </div>
            <div className="info-grid">
                <div><span>경로</span><p>{customer.source}</p></div>
                <div><span>매물종류</span><p>{customer.propertyType}</p></div>
                <div><span>연락처</span><p>{customer.phone}</p></div>
                <div><span>입주희망일</span><p>{customer.moveInDate}</p></div>
                <div><span>희망보증금</span><p>{customer.hopefulDeposit ? `${customer.hopefulDeposit}만원` : '-'}</p></div>
                <div><span>희망월세</span><p>{customer.hopefulMonthlyRent ? `${customer.hopefulMonthlyRent}만원` : '-'}</p></div>
            </div>
        </div>
        <div className="info-section">
            <h4>선호 지역</h4>
            <p>{customer.preferredArea || '-'}</p>
        </div>
        <div className="info-section">
            <h4>메모</h4>
            {isEditingMemo ? (
              <div>
                <textarea
                  value={memoValue}
                  onChange={(e) => setMemoValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="메모를 입력하세요... (Ctrl+Enter로 저장, Esc로 취소)"
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={handleSaveMemo}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    저장
                  </button>
                  <button
                    onClick={handleCancelMemo}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <p
                onClick={() => setIsEditingMemo(true)}
                style={{
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#f5f5f5',
                  minHeight: '40px',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#efefef'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              >
                {customer.memo || '(클릭하여 메모 추가)'}
              </p>
            )}
        </div>
    </div>
  );
};

export default BasicInfo;
