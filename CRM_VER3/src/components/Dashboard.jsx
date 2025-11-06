import React, { useMemo } from 'react';

const Dashboard = ({
  customers = [],
  meetings = [],
  activities = [],
  properties = [],
  contracts = [],
  onNavigate = () => {}
}) => {
  // 대시보드 통계 계산
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘의 미팅
    const todayMeetings = meetings.filter(m => {
      const meetingDate = new Date(m.date);
      meetingDate.setHours(0, 0, 0, 0);
      return meetingDate.getTime() === today.getTime();
    });

    // 연락할 고객 (3일 이상 미연락)
    const needsContact = customers.filter(c => {
      if (c.status === '보류') return false;

      const recentActivity = activities
        .filter(a => a.customerId === c.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

      if (!recentActivity) return true;

      const daysDiff = Math.floor((today - new Date(recentActivity.date)) / (1000 * 60 * 60 * 24));
      return daysDiff >= 3;
    });

    // 답장 대기 중 (활동이 있지만 팔로업 없음)
    const awaitingReply = activities
      .filter(a => {
        const activity = a;
        return activity.followUps && activity.followUps.length === 0;
      })
      .reduce((unique, a) => {
        const existing = unique.find(x => x.customerId === a.customerId);
        return existing ? unique : [...unique, a];
      }, []);

    // 신규 고객 (이번 주)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const newThisWeek = customers.filter(c => {
      const createdDate = new Date(c.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate >= weekAgo && c.status === '신규';
    });

    // 이번 주 신규 고객 수 (지난주와 비교)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    twoWeeksAgo.setHours(0, 0, 0, 0);

    const lastWeekNew = customers.filter(c => {
      const createdDate = new Date(c.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate >= twoWeeksAgo && createdDate < weekAgo && c.status === '신규';
    });

    const weekChange = newThisWeek.length - lastWeekNew.length;

    return {
      todayMeetings,
      needsContact,
      awaitingReply,
      newThisWeek,
      weekChange,
      totalCustomers: customers.length,
      totalProperties: properties.length,
      totalContracts: contracts.length
    };
  }, [customers, meetings, activities, properties, contracts]);

  const StatCard = ({ icon, title, number, subtitle, onClick, color = '#4CAF50' }) => (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: `2px solid ${color}20`,
        minWidth: '280px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
      <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#666', margin: '0 0 8px 0' }}>{title}</h3>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color, margin: '8px 0' }}>{number}</div>
      <p style={{ fontSize: '12px', color: '#999', margin: '8px 0 0 0' }}>{subtitle}</p>
    </div>
  );

  return (
    <div style={{ padding: '20px', overflow: 'auto', height: '100%' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>대시보드</h1>
        <p style={{ fontSize: '13px', color: '#999', margin: '0' }}>
          마지막 업데이트: {new Date().toLocaleString('ko-KR')}
        </p>
      </div>

      {/* 카드 그리드 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          maxWidth: '1400px',
          marginBottom: '30px'
        }}
      >
        {/* 오늘의 미팅 */}
        <StatCard
          icon="📅"
          title="오늘의 미팅"
          number={stats.todayMeetings.length}
          subtitle={
            stats.todayMeetings.length > 0
              ? `${stats.todayMeetings.length}명과 미팅 예정`
              : '미팅이 없습니다'
          }
          color="#FF6B9D"
          onClick={() => onNavigate('고객목록', '오늘미팅')}
        />

        {/* 연락할 고객 */}
        <StatCard
          icon="📞"
          title="연락할 고객"
          number={stats.needsContact.length}
          subtitle="3일 이상 미연락"
          color="#2196F3"
          onClick={() => onNavigate('고객목록', '연락할고객')}
        />

        {/* 답장 대기 중 */}
        <StatCard
          icon="⏰"
          title="답장 대기 중"
          number={stats.awaitingReply.length}
          subtitle="팔로업 필요"
          color="#FF9800"
          onClick={() => onNavigate('고객목록', '답장대기')}
        />

        {/* 신규 고객 (이번 주) */}
        <StatCard
          icon="✨"
          title="신규 고객 (이번 주)"
          number={stats.newThisWeek.length}
          subtitle={
            stats.weekChange > 0
              ? `지난주 대비 +${stats.weekChange}명`
              : stats.weekChange < 0
              ? `지난주 대비 ${stats.weekChange}명`
              : '지난주와 동일'
          }
          color="#4CAF50"
          onClick={() => onNavigate('고객목록', '신규')}
        />
      </div>

      {/* 오늘의 미팅 상세 리스트 */}
      {stats.todayMeetings.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', borderBottom: '2px solid #4CAF50', paddingBottom: '10px' }}>
            📅 오늘의 미팅
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.todayMeetings.map((meeting, idx) => {
              const customer = customers.find(c => c.id === meeting.customerId);
              return (
                <div
                  key={idx}
                  style={{
                    padding: '12px 15px',
                    backgroundColor: '#f5f5f5',
                    borderLeft: '4px solid #FF6B9D',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                >
                  <strong>{customer?.name || '알 수 없음'}</strong>
                  <div style={{ color: '#666', marginTop: '4px' }}>
                    📍 {meeting.location || '장소 미정'} | 📝 {meeting.memo || '메모 없음'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 통계 요약 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '12px'
      }}>
        <div>
          <p style={{ fontSize: '12px', color: '#999', margin: '0' }}>전체 고객</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '8px 0 0 0' }}>
            {stats.totalCustomers}명
          </p>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#999', margin: '0' }}>보유 매물</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '8px 0 0 0' }}>
            {stats.totalProperties}건
          </p>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#999', margin: '0' }}>관리 계약</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '8px 0 0 0' }}>
            {stats.totalContracts}건
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
