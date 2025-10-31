import React from 'react';

const BasicInfo = ({ customer, onUpdateCustomer, activities = [], meetings = [], onTabChange }) => {
  if (!customer) return null;

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

  // 경과일 계산 함수 (접수일부터 경과한 일수)
  const getElapsedDays = () => {
    if (!customer.createdAt) return null;
    const createdDate = new Date(customer.createdAt);
    const today = new Date();
    const timeDiff = today - createdDate;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  // 미팅 상태 계산 함수
  const getMeetingStatus = () => {
    if (customerMeetings.length === 0) return null;

    const latestMeeting = customerMeetings[0]; // 최신 미팅 (정렬되어 있음)
    const latestMeetingDate = new Date(latestMeeting.date);
    const today = new Date();

    // 시간 부분을 제거한 날짜만 비교
    const latestDate = new Date(latestMeetingDate.getFullYear(), latestMeetingDate.getMonth(), latestMeetingDate.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const timeDiff = latestDate - todayDate;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff > 0) {
      // 미팅이 아직 남아있음
      return { type: 'upcoming', days: daysDiff };
    } else if (daysDiff === 0) {
      // 오늘이 미팅 날짜
      return { type: 'today', days: 0 };
    } else {
      // 미팅이 지남
      return { type: 'past', days: Math.abs(daysDiff) };
    }
  };

  const truncateText = (text, maxLength = 40) => {
    if (!text) return '-';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className="basic-info-container">
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
              {getElapsedDays() !== null && (
                <span style={{
                  fontSize: '12px',
                  color: '#fff',
                  backgroundColor: '#9c27b0',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  marginLeft: 'auto'
                }}>
                  +{getElapsedDays()}일
                </span>
              )}
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
              {getMeetingStatus() && (
                <span style={{
                  fontSize: '12px',
                  color: '#fff',
                  backgroundColor: '#9c27b0',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  marginLeft: 'auto'
                }}>
                  {getMeetingStatus().type === 'upcoming' && `${getMeetingStatus().days}일 남음`}
                  {getMeetingStatus().type === 'today' && `오늘`}
                  {getMeetingStatus().type === 'past' && `+${getMeetingStatus().days}일`}
                </span>
              )}
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
