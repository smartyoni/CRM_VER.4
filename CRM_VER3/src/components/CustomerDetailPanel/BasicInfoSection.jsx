import React, { useState, useEffect } from 'react';

const BasicInfoSection = ({ customer, onUpdateCustomer }) => {
  const [isEditingPreferredArea, setIsEditingPreferredArea] = useState(false);
  const [preferredAreaValue, setPreferredAreaValue] = useState(() => {
    // 메모가 있으면 preferredArea 뒤에 추가
    const memo = customer?.memo || '';
    const preferredArea = customer?.preferredArea || '';
    if (memo && !preferredArea) {
      return memo;
    } else if (memo && preferredArea) {
      return `${preferredArea}\n\n${memo}`;
    }
    return preferredArea;
  });

  if (!customer) return null;

  useEffect(() => {
    const memo = customer.memo || '';
    const preferredArea = customer.preferredArea || '';
    if (memo && !preferredArea) {
      setPreferredAreaValue(memo);
    } else if (memo && preferredArea) {
      setPreferredAreaValue(`${preferredArea}\n\n${memo}`);
    } else {
      setPreferredAreaValue(preferredArea);
    }
    setIsEditingPreferredArea(false);
  }, [customer.id]);

  const handleSavePreferredArea = () => {
    onUpdateCustomer({
      ...customer,
      preferredArea: preferredAreaValue,
      memo: '' // 메모는 빈값으로 설정
    });
    setIsEditingPreferredArea(false);
  };

  const handleCancelPreferredArea = () => {
    const memo = customer.memo || '';
    const preferredArea = customer.preferredArea || '';
    if (memo && !preferredArea) {
      setPreferredAreaValue(memo);
    } else if (memo && preferredArea) {
      setPreferredAreaValue(`${preferredArea}\n\n${memo}`);
    } else {
      setPreferredAreaValue(preferredArea);
    }
    setIsEditingPreferredArea(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSavePreferredArea();
    } else if (e.key === 'Escape') {
      handleCancelPreferredArea();
    }
  };

  return (
    <div className="info-section" style={{
      padding: '15px',
      backgroundColor: '#ffffff',
      border: '2px solid #ff69b4',
      borderRadius: '8px',
      marginBottom: '15px'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <h4 style={{ margin: 0, color: '#ff1493', borderBottom: '2px solid #ff69b4', paddingBottom: '2px' }}>기본 정보</h4>
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#000000', borderBottom: '2px solid #000000', paddingBottom: '2px' }}>{customer.name}</span>
      </div>
      <div className="info-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '15px'
      }}>
        <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
          <span style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>연락처</span>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#2196F3' }}>
            <a href={`sms:${customer.phone}`} style={{ color: '#2196F3', textDecoration: 'none', cursor: 'pointer' }}>
              {customer.phone}
            </a>
          </p>
        </div>
        <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
          <span style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>입주희망일</span>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{customer.moveInDate}</p>
        </div>
        <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
          <span style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>희망보증금</span>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{customer.hopefulDeposit ? `${customer.hopefulDeposit}만원` : '-'}</p>
        </div>
        <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
          <span style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>희망월세</span>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{customer.hopefulMonthlyRent ? `${customer.hopefulMonthlyRent}만원` : '-'}</p>
        </div>
      </div>

      {/* 금액 지역 입주시기 상세정보 섹션 */}
      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <h5 style={{ margin: 0, color: '#ff1493', fontSize: '13px', fontWeight: '600' }}>금액 지역 입주시기 선호매물</h5>
          {isEditingPreferredArea && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={handleSavePreferredArea}
                style={{
                  padding: '4px 10px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}
              >
                저장
              </button>
              <button
                onClick={handleCancelPreferredArea}
                style={{
                  padding: '4px 10px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}
              >
                취소
              </button>
            </div>
          )}
        </div>
        {isEditingPreferredArea ? (
          <textarea
            value={preferredAreaValue}
            onChange={(e) => setPreferredAreaValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="금액, 지역, 입주시기 등 상세정보를 입력하세요... (Ctrl+Enter로 저장, Esc로 취소)"
            style={{
              width: '100%',
              minHeight: '60px',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'inherit',
              fontSize: '13px',
              resize: 'vertical'
            }}
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditingPreferredArea(true)}
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: '#fafafa',
              minHeight: '30px',
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              transition: 'background-color 0.2s',
              fontSize: '13px',
              color: preferredAreaValue ? '#333' : '#999'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
          >
            {preferredAreaValue || '(클릭하여 추가)'}
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicInfoSection;
