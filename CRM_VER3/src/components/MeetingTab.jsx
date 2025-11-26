import React from 'react';
import MeetingCard from './MeetingCard';

const MeetingTab = ({ meetings = [], customers = [], onCardClick }) => {
  // 미팅을 최신순으로 정렬하고 상위 5개만 추출
  const recentMeetings = meetings
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // customerId로 고객명을 찾는 헬퍼 함수
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : '고객 미상';
  };

  return (
    <div
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* 헤더 */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
          🗓️ 최신 미팅
        </h2>
        <p style={{ margin: '0', fontSize: '13px', color: '#999' }}>
          가장 최신 5개의 미팅 정보입니다
        </p>
      </div>

      {/* 미팅 카드 리스트 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '8px'
        }}
      >
        {recentMeetings.length > 0 ? (
          recentMeetings.map(meeting => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              customerName={getCustomerName(meeting.customerId)}
              onClick={onCardClick}
            />
          ))
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#999'
            }}
          >
            <p style={{ fontSize: '14px', margin: '0' }}>등록된 미팅이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingTab;
