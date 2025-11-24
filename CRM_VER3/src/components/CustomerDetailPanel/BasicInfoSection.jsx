import React from 'react';

const BasicInfoSection = ({ customer, onUpdateCustomer }) => {
  if (!customer) return null;

  return (
    <section style={{
      marginBottom: '15px'
    }}>
      <h4 style={{
        fontSize: '13px',
        fontWeight: '600',
        color: '#666',
        marginBottom: '10px',
        paddingBottom: '8px',
        borderBottom: '2px solid #2196F3',
        margin: 0
      }}>
        📋 기본 정보
      </h4>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        fontSize: '13px',
        marginTop: '10px'
      }}>
        {/* 고객명 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '100px 1fr',
          gap: '10px',
          alignItems: 'flex-start'
        }}>
          <span style={{ fontWeight: '600', color: '#666' }}>고객명:</span>
          <span style={{ color: '#333' }}>{customer.name || '-'}</span>
        </div>

        {/* 연락처 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '100px 1fr',
          gap: '10px',
          alignItems: 'flex-start'
        }}>
          <span style={{ fontWeight: '600', color: '#666' }}>연락처:</span>
          <a href={`sms:${customer.phone}`} style={{
            color: '#2196F3',
            textDecoration: 'none',
            cursor: 'pointer'
          }}>
            {customer.phone || '-'}
          </a>
        </div>

        {/* 출처 */}
        {customer.source && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr',
            gap: '10px',
            alignItems: 'flex-start'
          }}>
            <span style={{ fontWeight: '600', color: '#666' }}>출처:</span>
            <span style={{ color: '#333' }}>{customer.source}</span>
          </div>
        )}

        {/* 매물유형 */}
        {customer.propertyType && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr',
            gap: '10px',
            alignItems: 'flex-start'
          }}>
            <span style={{ fontWeight: '600', color: '#666' }}>매물유형:</span>
            <span style={{ color: '#333' }}>{customer.propertyType}</span>
          </div>
        )}

        {/* 입주희망일 */}
        {customer.moveInDate && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr',
            gap: '10px',
            alignItems: 'flex-start'
          }}>
            <span style={{ fontWeight: '600', color: '#666' }}>입주희망일:</span>
            <span style={{ color: '#333' }}>{customer.moveInDate}</span>
          </div>
        )}

        {/* 희망보증금 */}
        {customer.hopefulDeposit && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr',
            gap: '10px',
            alignItems: 'flex-start'
          }}>
            <span style={{ fontWeight: '600', color: '#666' }}>희망보증금:</span>
            <span style={{ color: '#333' }}>{customer.hopefulDeposit}만원</span>
          </div>
        )}

        {/* 희망월세 */}
        {customer.hopefulMonthlyRent && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr',
            gap: '10px',
            alignItems: 'flex-start'
          }}>
            <span style={{ fontWeight: '600', color: '#666' }}>희망월세:</span>
            <span style={{ color: '#333' }}>{customer.hopefulMonthlyRent}만원</span>
          </div>
        )}

        {/* 선호지역 */}
        {customer.preferredArea && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr',
            gap: '10px',
            alignItems: 'flex-start'
          }}>
            <span style={{ fontWeight: '600', color: '#666' }}>선호지역:</span>
            <span style={{ color: '#333', wordBreak: 'break-word' }}>{customer.preferredArea}</span>
          </div>
        )}

        {/* 메모 */}
        {customer.memo && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr',
            gap: '10px',
            alignItems: 'flex-start'
          }}>
            <span style={{ fontWeight: '600', color: '#666' }}>메모:</span>
            <span style={{ color: '#333', wordBreak: 'break-word' }}>{customer.memo}</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default BasicInfoSection;
