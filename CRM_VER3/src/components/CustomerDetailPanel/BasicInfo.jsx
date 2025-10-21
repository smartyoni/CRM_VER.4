import React, { useState, useEffect } from 'react';

const BasicInfo = ({ customer, onUpdateCustomer, activities = [], meetings = [], onTabChange }) => {
  const [isEditingPreferredArea, setIsEditingPreferredArea] = useState(false);
  const [preferredAreaValue, setPreferredAreaValue] = useState(customer.preferredArea || '');

  if (!customer) return null;

  // 고객이 변경될 때마다 선호지역 상태 초기화
  useEffect(() => {
    setPreferredAreaValue(customer.preferredArea || '');
    setIsEditingPreferredArea(false);
  }, [customer.id]);

  const handleSavePreferredArea = () => {
    onUpdateCustomer({
      ...customer,
      preferredArea: preferredAreaValue
    });
    setIsEditingPreferredArea(false);
  };

  const handleCancelPreferredArea = () => {
    setPreferredAreaValue(customer.preferredArea || '');
    setIsEditingPreferredArea(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      if (isEditingPreferredArea) {
        handleSavePreferredArea();
      }
    } else if (e.key === 'Escape') {
      if (isEditingPreferredArea) {
        handleCancelPreferredArea();
      }
    }
  };

  // 고객 활동과 미팅 필터링
  const customerActivities = activities.filter(a => a.customerId === customer.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const customerMeetings = meetings.filter(m => m.customerId === customer.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // 최근 3개 활동
  const recentActivities = customerActivities.slice(0, 3);

  // 최근 3개 미팅
  const recentMeetings = customerMeetings.slice(0, 3);

  // 다음 미팅 찾기
  const nextMeeting = customerMeetings.find(m => new Date(m.date) > new Date());

  // 오늘 날짜 확인 함수
  const isToday = (dateString) => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const activityDate = dateString.slice(0, 10);
    return activityDate === todayStr;
  };

  const truncateText = (text, maxLength = 40) => {
    if (!text) return '-';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className="basic-info-container">
        <div className="info-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <h4 style={{ margin: 0 }}>기본 정보</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 'bold', color: '#555', fontSize: '12px' }}>고객명</span>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: '#2196F3' }}>{customer.name}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                    <span style={{ color: '#888' }}>경로:</span>
                    <span style={{ fontWeight: 'bold' }}>{customer.source}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                    <span style={{ color: '#888' }}>매물종류:</span>
                    <span style={{ fontWeight: 'bold' }}>{customer.propertyType}</span>
                </div>
            </div>
            <div className="info-grid">
                <div><span>연락처</span><p><a href={`sms:${customer.phone}`} style={{ color: '#2196F3', textDecoration: 'none', cursor: 'pointer' }}>{customer.phone}</a></p></div>
                <div><span>입주희망일</span><p>{customer.moveInDate}</p></div>
                <div><span>희망보증금</span><p>{customer.hopefulDeposit ? `${customer.hopefulDeposit}만원` : '-'}</p></div>
                <div><span>희망월세</span><p>{customer.hopefulMonthlyRent ? `${customer.hopefulMonthlyRent}만원` : '-'}</p></div>
            </div>
        </div>
        <div className="info-section">
            <h4>금액 지역 입주시기 상세정보</h4>
            {isEditingPreferredArea ? (
              <div>
                <textarea
                  value={preferredAreaValue}
                  onChange={(e) => setPreferredAreaValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="금액, 지역, 입주시기 등 상세정보를 입력하세요... (Ctrl+Enter로 저장, Esc로 취소)"
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
                    onClick={handleSavePreferredArea}
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
                    onClick={handleCancelPreferredArea}
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
                onClick={() => setIsEditingPreferredArea(true)}
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
                {customer.preferredArea || '(클릭하여 추가)'}
              </p>
            )}
        </div>
        {/* 활동/미팅 대시보드 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', margin: '15px' }}>
          {/* 활동 요약 카드 */}
          <div
            onClick={() => onTabChange && onTabChange('활동 내역')}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              minHeight: '250px',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>📊</span>
              <h5 style={{ margin: 0, color: '#2196F3', fontWeight: 'bold' }}>활동 내역</h5>
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
              총 <span style={{ fontWeight: 'bold', color: '#2196F3' }}>{customerActivities.length}</span>건의 활동
              {customerActivities.length > 0 && (
                <span style={{ color: '#888', marginLeft: '8px' }}>
                  (최근: {customerActivities[0].date})
                </span>
              )}
            </div>
            {recentActivities.length > 0 ? (
              <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                {recentActivities.map((activity, idx) => {
                  const isTodayActivity = isToday(activity.date);
                  return (
                    <div key={idx} style={{
                      padding: '6px 0',
                      borderTop: idx > 0 ? '1px solid #f0f0f0' : 'none',
                      color: isTodayActivity ? '#d32f2f' : '#555',
                      fontWeight: isTodayActivity ? 'bold' : 'normal',
                      backgroundColor: isTodayActivity ? 'rgba(211, 47, 47, 0.05)' : 'transparent',
                      paddingLeft: isTodayActivity ? '8px' : '0px',
                      borderRadius: isTodayActivity ? '4px' : '0px'
                    }}>
                      <span style={{ color: isTodayActivity ? '#d32f2f' : '#999', marginRight: '4px' }}>{activity.date}</span>
                      {truncateText(activity.content, 30)}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#999', textAlign: 'center', padding: '8px' }}>
                활동이 없습니다
              </div>
            )}
          </div>

          {/* 미팅 요약 카드 */}
          <div
            onClick={() => onTabChange && onTabChange('미팅 내역')}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              minHeight: '250px',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>📅</span>
              <h5 style={{ margin: 0, color: '#2196F3', fontWeight: 'bold' }}>미팅 내역</h5>
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
              총 <span style={{ fontWeight: 'bold', color: '#2196F3' }}>{customerMeetings.length}</span>건의 미팅
              {nextMeeting && (
                <span style={{ color: '#16a085', marginLeft: '8px', fontWeight: 'bold' }}>
                  (다음: {nextMeeting.date.slice(0, 10)})
                </span>
              )}
            </div>
            {recentMeetings.length > 0 ? (
              <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                {recentMeetings.map((meeting, idx) => {
                  const isTodayMeeting = isToday(meeting.date);
                  return (
                    <div key={idx} style={{
                      padding: '6px 0',
                      borderTop: idx > 0 ? '1px solid #f0f0f0' : 'none',
                      color: isTodayMeeting ? '#d32f2f' : '#555',
                      fontWeight: isTodayMeeting ? 'bold' : 'normal',
                      backgroundColor: isTodayMeeting ? 'rgba(211, 47, 47, 0.05)' : 'transparent',
                      paddingLeft: isTodayMeeting ? '8px' : '0px',
                      borderRadius: isTodayMeeting ? '4px' : '0px'
                    }}>
                      <span style={{ color: isTodayMeeting ? '#d32f2f' : '#999', marginRight: '4px' }}>{meeting.date.slice(0, 10)}</span>
                      <span style={{ color: isTodayMeeting ? '#d32f2f' : '#2196F3', fontWeight: 'bold' }}>
                        {meeting.properties?.length || 0}개 매물
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#999', textAlign: 'center', padding: '8px' }}>
                미팅이 없습니다
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default BasicInfo;
