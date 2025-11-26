import React, { useMemo, useState } from 'react';
import MeetingTab from './MeetingTab';

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

  // 디버깅: contracts 데이터 확인
  React.useEffect(() => {
    if (activeFilter === '중개업무') {
      console.log('Dashboard contracts:', contracts);
      console.log('Contracts with historyCards:', contracts.filter(c => c.historyCards && c.historyCards.length > 0));
    }
  }, [contracts, activeFilter]);
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

    // 금월계약 (계약서작성일이 이번 달)
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const thisMonthContracts = contracts.filter(c => {
      if (!c.contractDate) return false;
      const contractDate = new Date(c.contractDate);
      return (
        contractDate.getFullYear() === currentYear &&
        contractDate.getMonth() === currentMonth
      );
    });

    // 금월잔금 (잔금일이 이번 달)
    const thisMonthBalance = contracts.filter(c => {
      if (!c.balanceDate) return false;
      const balanceDate = new Date(c.balanceDate);
      return (
        balanceDate.getFullYear() === currentYear &&
        balanceDate.getMonth() === currentMonth
      );
    });

    // 전월입금 (입금일이 지난달)
    const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const previousYear = previousMonthDate.getFullYear();
    const previousMonth = previousMonthDate.getMonth();

    const lastMonthPayment = contracts.filter(c => {
      if (!c.remainderPaymentDate) return false;
      const paymentDate = new Date(c.remainderPaymentDate);
      return (
        paymentDate.getFullYear() === previousYear &&
        paymentDate.getMonth() === previousMonth
      );
    });

    // 금월입금 (입금일이 이번 달)
    const thisMonthPayment = contracts.filter(c => {
      if (!c.remainderPaymentDate) return false;
      const paymentDate = new Date(c.remainderPaymentDate);
      return (
        paymentDate.getFullYear() === currentYear &&
        paymentDate.getMonth() === currentMonth
      );
    });

    // 다음달입금 (입금일이 다음달)
    const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
    const nextYear = nextMonthDate.getFullYear();
    const nextMonth = nextMonthDate.getMonth();

    const nextMonthPayment = contracts.filter(c => {
      if (!c.remainderPaymentDate) return false;
      const paymentDate = new Date(c.remainderPaymentDate);
      return (
        paymentDate.getFullYear() === nextYear &&
        paymentDate.getMonth() === nextMonth
      );
    });

    // 중개보수 총합 (모든 계약호실의 중개보수금액 합산)
    const totalBrokerageFee = contracts.reduce((sum, c) => {
      return sum + (Number(c.brokerageFee) || 0);
    }, 0);

    return {
      todayContracts,
      todayBalance,
      todayMeetings,
      futureContracts,
      futureBalance,
      futureMeetings,
      thisMonthContracts,
      thisMonthBalance,
      lastMonthPayment,
      thisMonthPayment,
      nextMonthPayment,
      needsContact,
      awaitingReply,
      newThisWeek,
      weekChange,
      totalCustomers: customers.length,
      totalProperties: properties.length,
      totalContracts: contracts.length,
      totalBrokerageFee
    };
  }, [customers, meetings, activities, properties, contracts]);

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace(/\s/g, '').replace(/\./g, '-').substring(0, 5);
  };

  // 항목 클릭 핸들러 (카드 리스트 또는 모달에서)
  const handleItemClick = (item, type, cardTitle) => {
    if (type === 'contract' || type === 'balance') {
      // 계약 데이터의 ID를 전달하여 상세패널 직접 열기
      onNavigate('계약호실', '전체', item.id, 'contract');
      setModalOpen(false);
    } else if (type === 'meeting') {
      // 고객 ID 전달하여 상세패널 직접 열기
      onNavigate('고객관리', '오늘미팅', item.customerId, 'customer');
      setModalOpen(false);
    } else if (type === 'customer') {
      // 고객 카드 타입 처리
      if (cardTitle === '즐겨찾기' || cardTitle === '미활동') {
        // 즐겨찾기, 미활동 → 고객상세패널 이동
        onNavigate('고객관리', '전체', item.id, 'customer');
        setModalOpen(false);
      } else if (cardTitle === '활동기록') {
        // 활동기록 → 해당 고객의 최신 활동기록으로 이동
        const recentActivity = activities
          .filter(a => a.customerId === item.id)
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        if (recentActivity) {
          onNavigate('고객관리', '활동기록', item.id, 'activity', recentActivity.id);
        } else {
          // 활동기록이 없으면 고객상세패널로 이동
          onNavigate('고객관리', '전체', item.id, 'customer');
        }
        setModalOpen(false);
      }
    }
  };

  // 모달 팝업 열기
  const openModal = (type, title, data) => {
    setModalData({ type, title, data });
    setModalOpen(true);
  };

  // 신규 StatCard 컴포넌트 (헤더 + 리스트 형식)
  const StatCard = ({ title, number, items = [], onClick, color = '#4CAF50', type = 'contract', brokerageFeeTotal = 0 }) => {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '1000', color, margin: 0 }}>{title}</h3>
            {brokerageFeeTotal > 0 && (
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#FF6B00' }}>
                {(brokerageFeeTotal / 10000).toLocaleString('ko-KR')} 만원
              </span>
            )}
          </div>
          <span style={{ fontSize: '18px', fontWeight: '1000', color, backgroundColor: `${color}15`, padding: '4px 10px', borderRadius: '4px' }}>{number}건</span>
        </div>

        {/* 항목 리스트 */}
        {items.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
            {displayItems.map((item, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  // 카드의 리스트 항목 클릭 시 모달 팝업 열기 또는 직접 이동
                  if (type === 'customer') {
                    handleItemClick(item, type, title);
                  } else {
                    openModal(type, title, items);
                  }
                }}
                style={{
                  color: '#555',
                  padding: '6px 0',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2196F3';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#555';
                }}
              >
                <span style={{ fontWeight: 'bold', color: '#000', minWidth: '20px' }}>{idx + 1}.</span>
                {type === 'contract' || type === 'balance' ? (
                  <div>{[item.buildingName, item.roomName].filter(Boolean).join(' ')} - {formatDate(type === 'contract' ? item.contractDate : item.balanceDate)}</div>
                ) : type === 'customer' ? (
                  <div>{item.name || '알 수 없음'}</div>
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
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
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
                <span style={{ fontWeight: 'bold', color: '#000', minWidth: '24px', marginTop: '2px' }}>{idx + 1}.</span>
                {type === 'contract' || type === 'balance' ? (
                  <div style={{ fontSize: '13px', fontWeight: '500', flex: 1 }}>
                    <div>{[item.buildingName, item.roomName].filter(Boolean).join(' ')}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {type === 'contract' ? `계약일: ${formatDate(item.contractDate)}` : `잔금일: ${formatDate(item.balanceDate)}`}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', fontWeight: '500', flex: 1 }}>
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

  // 미팅 카드 클릭 핸들러 - 고객상세패널로 이동하면서 미팅 선택
  const handleMeetingCardClick = (meeting) => {
    if (meeting && meeting.customerId) {
      // 고객상세패널로 이동하고 미팅ID 전달 (미팅탭에서 해당 미팅의 모달을 자동으로 띄우게 함)
      onNavigate('고객관리', '전체', meeting.customerId, 'customer', meeting.id);
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* 고객관리 필터 - 3개 카드 */}
      {activeFilter === '고객관리' && (() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. 즐겨찾기: 즐겨찾기 된 고객을 접수일 최신순으로 5개
        const favoriteCustomers = customers
          .filter(c => c.isFavorite)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        // 2. 활동기록: 최신 활동기록순으로 5개의 고객
        const customersWithActivity = customers
          .map(c => {
            const recentActivity = activities
              .filter(a => a.customerId === c.id)
              .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            return {
              ...c,
              lastActivityDate: recentActivity ? new Date(recentActivity.date) : null
            };
          })
          .filter(c => c.lastActivityDate)
          .sort((a, b) => b.lastActivityDate - a.lastActivityDate)
          .slice(0, 5);

        // 3. 미활동: 활동기록이 오늘로부터 먼 순서대로 5개
        const inactiveCustomers = customers
          .map(c => {
            const recentActivity = activities
              .filter(a => a.customerId === c.id)
              .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            return {
              ...c,
              lastActivityDate: recentActivity ? new Date(recentActivity.date) : new Date(0)
            };
          })
          .sort((a, b) => a.lastActivityDate - b.lastActivityDate)
          .slice(0, 5);

        return (
          <div className="dashboard-grid">
            {/* 즐겨찾기 */}
            <StatCard
              title="즐겨찾기"
              number={customers.filter(c => c.isFavorite).length}
              items={favoriteCustomers.map(c => ({
                ...c,
                displayName: c.name
              }))}
              color="#FF6B9D"
              type="customer"
              onClick={() => openModal('customer', '즐겨찾기', favoriteCustomers)}
            />

            {/* 활동기록 */}
            <StatCard
              title="활동기록"
              number={customers.length}
              items={customersWithActivity.map(c => ({
                ...c,
                displayName: c.name
              }))}
              color="#2196F3"
              type="customer"
              onClick={() => openModal('customer', '활동기록', customersWithActivity)}
            />

            {/* 미활동 */}
            <StatCard
              title="미활동"
              number={customers.length}
              items={inactiveCustomers.map(c => ({
                ...c,
                displayName: c.name
              }))}
              color="#FF9800"
              type="customer"
              onClick={() => openModal('customer', '미활동', inactiveCustomers)}
            />
          </div>
        );
      })()}

      {/* 미팅관리 필터 - 최신 미팅 5개 */}
      {activeFilter === '미팅관리' && (
        <MeetingTab
          meetings={meetings}
          customers={customers}
          onCardClick={handleMeetingCardClick}
        />
      )}

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
