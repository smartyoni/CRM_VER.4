import React, { useMemo, useState } from 'react';

const Dashboard = ({
  customers = [],
  meetings = [],
  activities = [],
  properties = [],
  contracts = [],
  activeFilter = '오늘업무',
  onNavigate = () => {}
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  // 대시보드 통계 계산
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘의 계약 (계약서작성일이 오늘)
    const todayContracts = contracts.filter(c => {
      if (!c.contractDate) return false;
      const contractDate = new Date(c.contractDate);
      contractDate.setHours(0, 0, 0, 0);
      return contractDate.getTime() === today.getTime();
    });

    // 오늘의 잔금 (잔금일이 오늘)
    const todayBalance = contracts.filter(c => {
      if (!c.balanceDate) return false;
      const balanceDate = new Date(c.balanceDate);
      balanceDate.setHours(0, 0, 0, 0);
      return balanceDate.getTime() === today.getTime();
    });

    // 오늘의 미팅
    const todayMeetings = meetings.filter(m => {
      const meetingDate = new Date(m.date);
      meetingDate.setHours(0, 0, 0, 0);
      return meetingDate.getTime() === today.getTime();
    });

    // 앞으로 예정된 계약 (미래)
    const futureContracts = contracts.filter(c => {
      if (!c.contractDate) return false;
      const contractDate = new Date(c.contractDate);
      contractDate.setHours(0, 0, 0, 0);
      return contractDate.getTime() > today.getTime();
    });

    // 앞으로 예정된 잔금 (미래)
    const futureBalance = contracts.filter(c => {
      if (!c.balanceDate) return false;
      const balanceDate = new Date(c.balanceDate);
      balanceDate.setHours(0, 0, 0, 0);
      return balanceDate.getTime() > today.getTime();
    });

    // 앞으로 예정된 미팅 (미래)
    const futureMeetings = meetings.filter(m => {
      const meetingDate = new Date(m.date);
      meetingDate.setHours(0, 0, 0, 0);
      return meetingDate.getTime() > today.getTime();
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
      todayContracts,
      todayBalance,
      todayMeetings,
      futureContracts,
      futureBalance,
      futureMeetings,
      needsContact,
      awaitingReply,
      newThisWeek,
      weekChange,
      totalCustomers: customers.length,
      totalProperties: properties.length,
      totalContracts: contracts.length
    };
  }, [customers, meetings, activities, properties, contracts]);

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace(/\s/g, '').replace(/\./g, '-').substring(0, 5);
  };

  // 항목 클릭 핸들러 (카드 리스트 또는 모달에서)
  const handleItemClick = (item, type) => {
    if (type === 'contract' || type === 'balance') {
      // 계약 데이터의 ID를 전달하여 상세패널 직접 열기
      onNavigate('계약호실', '전체', item.id, 'contract');
      setModalOpen(false);
    } else if (type === 'meeting') {
      // 고객 ID 전달하여 상세패널 직접 열기
      onNavigate('고객목록', '오늘미팅', item.customerId, 'customer');
      setModalOpen(false);
    }
  };

  // 모달 팝업 열기
  const openModal = (type, title, data) => {
    setModalData({ type, title, data });
    setModalOpen(true);
  };

  // 신규 StatCard 컴포넌트 (헤더 + 리스트 형식)
  const StatCard = ({ title, number, items, onClick, color = '#4CAF50', type = 'contract' }) => {
    const displayItems = items.slice(0, 5);
    const remainingCount = items.length - 5;

    return (
      <div
        onClick={onClick}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          border: `2px solid ${color}20`,
          minWidth: '280px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
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
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${color}40`, paddingBottom: '8px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color, margin: 0 }}>{title}</h3>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color, backgroundColor: `${color}15`, padding: '4px 10px', borderRadius: '4px' }}>{number}건</span>
        </div>

        {/* 항목 리스트 */}
        {items.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            {displayItems.map((item, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  // 카드의 리스트 항목 클릭 시 모달 팝업 열기
                  openModal(type, title, items);
                }}
                style={{
                  color: '#555',
                  padding: '6px 0',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2196F3';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#555';
                }}
              >
                {type === 'contract' || type === 'balance' ? (
                  <div>{[item.buildingName, item.roomName].filter(Boolean).join(' ')} - {formatDate(type === 'contract' ? item.contractDate : item.balanceDate)}</div>
                ) : (
                  <div>{customers.find(c => c.id === item.customerId)?.name || '알 수 없음'} - {formatDate(item.date)}</div>
                )}
              </div>
            ))}
            {remainingCount > 0 && <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>외 {remainingCount}건</div>}
          </div>
        ) : (
          <div style={{ color: '#999', fontSize: '13px', padding: '8px 0' }}>일정이 없습니다</div>
        )}
      </div>
    );
  };

  // 모달 컴포넌트
  const Modal = ({ isOpen, title, items, type, onClose, onItemClick }) => {
    if (!isOpen) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: '#FFF',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '70vh',
            overflow: 'auto',
            padding: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 모달 헤더 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e0e0e0', paddingBottom: '15px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: 0,
                color: '#666'
              }}
            >
              ×
            </button>
          </div>

          {/* 항목 리스트 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onItemClick(item, type)}
                style={{
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid #e0e0e0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8f4f8';
                  e.currentTarget.style.borderColor = '#2196F3';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                {type === 'contract' || type === 'balance' ? (
                  <div style={{ fontSize: '13px', fontWeight: '500' }}>
                    <div>{[item.buildingName, item.roomName].filter(Boolean).join(' ')}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {type === 'contract' ? `계약일: ${formatDate(item.contractDate)}` : `잔금일: ${formatDate(item.balanceDate)}`}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', fontWeight: '500' }}>
                    <div>{customers.find(c => c.id === item.customerId)?.name || '알 수 없음'}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      미팅일: {formatDate(item.date)} | {item.location || '장소 미정'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', overflow: 'auto', height: '100%' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>대시보드</h1>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff0000' }}>
            {(() => {
              const today = new Date();
              const year = today.getFullYear();
              const month = String(today.getMonth() + 1).padStart(2, '0');
              const date = String(today.getDate()).padStart(2, '0');
              const hours = String(today.getHours()).padStart(2, '0');
              const minutes = String(today.getMinutes()).padStart(2, '0');
              return `${year}년 ${month}월 ${date}일 ${hours}:${minutes}`;
            })()}
          </span>
        </div>
        <p style={{ fontSize: '13px', color: '#999', margin: '8px 0 0 0' }}>
          마지막 업데이트: {new Date().toLocaleString('ko-KR')}
        </p>
      </div>

      {/* 오늘업무 필터 - 3개 카드 */}
      {activeFilter === '오늘업무' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            maxWidth: '1400px',
            marginBottom: '30px'
          }}
        >
          {/* 오늘계약 */}
          <StatCard
            title="오늘계약"
            number={stats.todayContracts.length}
            items={stats.todayContracts.sort((a, b) => new Date(a.contractDate) - new Date(b.contractDate))}
            color="#2196F3"
            type="contract"
            onClick={() => openModal('contract', '오늘계약', stats.todayContracts.sort((a, b) => new Date(a.contractDate) - new Date(b.contractDate)))}
          />

          {/* 오늘잔금 */}
          <StatCard
            title="오늘잔금"
            number={stats.todayBalance.length}
            items={stats.todayBalance.sort((a, b) => new Date(a.balanceDate) - new Date(b.balanceDate))}
            color="#FF9800"
            type="balance"
            onClick={() => openModal('balance', '오늘잔금', stats.todayBalance.sort((a, b) => new Date(a.balanceDate) - new Date(b.balanceDate)))}
          />

          {/* 오늘미팅 */}
          <StatCard
            title="오늘미팅"
            number={stats.todayMeetings.length}
            items={stats.todayMeetings.sort((a, b) => new Date(a.date) - new Date(b.date))}
            color="#FF6B9D"
            type="meeting"
            onClick={() => openModal('meeting', '오늘미팅', stats.todayMeetings.sort((a, b) => new Date(a.date) - new Date(b.date)))}
          />
        </div>
      )}

      {/* 예정된업무 필터 - 3개 카드 */}
      {activeFilter === '예정된업무' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            maxWidth: '1400px',
            marginBottom: '30px'
          }}
        >
          {/* 계약예정 */}
          <StatCard
            title="계약예정"
            number={stats.futureContracts.length}
            items={stats.futureContracts.sort((a, b) => new Date(a.contractDate) - new Date(b.contractDate))}
            color="#2196F3"
            type="contract"
            onClick={() => openModal('contract', '계약예정', stats.futureContracts.sort((a, b) => new Date(a.contractDate) - new Date(b.contractDate)))}
          />

          {/* 잔금예정 */}
          <StatCard
            title="잔금예정"
            number={stats.futureBalance.length}
            items={stats.futureBalance.sort((a, b) => new Date(a.balanceDate) - new Date(b.balanceDate))}
            color="#FF9800"
            type="balance"
            onClick={() => openModal('balance', '잔금예정', stats.futureBalance.sort((a, b) => new Date(a.balanceDate) - new Date(b.balanceDate)))}
          />

          {/* 미팅예정 */}
          <StatCard
            title="미팅예정"
            number={stats.futureMeetings.length}
            items={stats.futureMeetings.sort((a, b) => new Date(a.date) - new Date(b.date))}
            color="#FF6B9D"
            type="meeting"
            onClick={() => openModal('meeting', '미팅예정', stats.futureMeetings.sort((a, b) => new Date(a.date) - new Date(b.date)))}
          />
        </div>
      )}

      {/* 기타 필터들 - 기존 카드 */}
      {activeFilter !== '오늘업무' && activeFilter !== '예정된업무' && (
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
      )}

      {/* 오늘의 미팅 상세 리스트 */}
      {activeFilter === '오늘업무' && stats.todayMeetings.length > 0 && (
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

      {/* 모달 렌더링 */}
      {modalData && (
        <Modal
          isOpen={modalOpen}
          title={modalData.title}
          items={modalData.data}
          type={modalData.type}
          onClose={() => setModalOpen(false)}
          onItemClick={handleItemClick}
        />
      )}
    </div>
  );
};

export default Dashboard;
