import React from 'react';

const MeetingCard = ({ meeting, customerName, onClick }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}월 ${day}일 ${hours}:${minutes}`;
  };

  const getPropertyRoomNames = () => {
    if (!meeting.properties || meeting.properties.length === 0) return '매물 없음';
    if (meeting.properties.length === 1) {
      return meeting.properties[0].roomName || '-';
    }
    return `${meeting.properties[0].roomName || '-'} 외 ${meeting.properties.length - 1}개`;
  };

  return (
    <div
      onClick={() => onClick && onClick(meeting)}
      style={{
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* 고객명 */}
      <div style={{ marginBottom: '8px' }}>
        <h3
          style={{
            margin: '0 0 4px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333'
          }}
        >
          {customerName || '고객 미상'}
        </h3>
      </div>

      {/* 미팅일시 */}
      <div style={{ marginBottom: '8px' }}>
        <p
          style={{
            margin: '0',
            fontSize: '13px',
            color: '#666'
          }}
        >
          📅 {formatDateTime(meeting.date)}
        </p>
      </div>

      {/* 매물호실명 */}
      <div>
        <p
          style={{
            margin: '0',
            fontSize: '13px',
            color: '#999'
          }}
        >
          🏠 {getPropertyRoomNames()}
        </p>
      </div>
    </div>
  );
};

export default MeetingCard;
