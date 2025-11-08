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
  const handleItemClick = (item, type) => {
    if (type === 'contract' || type === 'balance') {
      // 계약 데이터의 ID를 전달하여 상세패널 직접 열기
      onNavigate('계약호실', '전체', item.id, 'contract');
      setModalOpen(false);
    } else if (type === 'meeting') {
      // 고객 ID 전달하여 상세패널 직접 열기
      onNavigate('고객관리', '오늘미팅', item.customerId, 'customer');
      setModalOpen(false);
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
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 중개업무 필터 - 5개 카드 (고정 영역) */}
      {activeFilter === '중개업무' && (
        <div className="dashboard-grid" style={{ marginBottom: '0px' }}>
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

          {/* 금월계약 */}
          <StatCard
            title="금월계약"
            number={stats.thisMonthContracts.length}
            items={stats.thisMonthContracts.sort((a, b) => new Date(a.contractDate) - new Date(b.contractDate))}
            color="#4CAF50"
            type="contract"
            onClick={() => openModal('contract', '금월계약', stats.thisMonthContracts.sort((a, b) => new Date(a.contractDate) - new Date(b.contractDate)))}
          />

          {/* 금월잔금 */}
          <StatCard
            title="금월잔금"
            number={stats.thisMonthBalance.length}
            items={stats.thisMonthBalance.sort((a, b) => new Date(a.balanceDate) - new Date(b.balanceDate))}
            color="#9C27B0"
            type="balance"
            onClick={() => openModal('balance', '금월잔금', stats.thisMonthBalance.sort((a, b) => new Date(a.balanceDate) - new Date(b.balanceDate)))}
          />

          {/* 예정된미팅 */}
          <StatCard
            title="예정된미팅"
            number={stats.futureMeetings.length}
            items={stats.futureMeetings.sort((a, b) => new Date(a.date) - new Date(b.date))}
            color="#FFC107"
            type="meeting"
            onClick={() => openModal('meeting', '예정된미팅', stats.futureMeetings.sort((a, b) => new Date(a.date) - new Date(b.date)))}
          />
        </div>
      )}

      {/* 중개보수 필터 - 3개 카드 */}
      {activeFilter === '중개보수' && (
        <div className="dashboard-grid">
          {/* 전월입금 */}
          <StatCard
            title="전월입금"
            number={stats.lastMonthPayment.length}
            items={stats.lastMonthPayment.sort((a, b) => new Date(a.remainderPaymentDate) - new Date(b.remainderPaymentDate))}
            color="#9C27B0"
            type="contract"
            brokerageFeeTotal={stats.lastMonthPayment.reduce((sum, c) => sum + (Number(c.brokerageFee) || 0), 0)}
            onClick={() => openModal('contract', '전월입금', stats.lastMonthPayment.sort((a, b) => new Date(a.remainderPaymentDate) - new Date(b.remainderPaymentDate)))}
          />

          {/* 금월입금 */}
          <StatCard
            title="금월입금"
            number={stats.thisMonthPayment.length}
            items={stats.thisMonthPayment.sort((a, b) => new Date(a.remainderPaymentDate) - new Date(b.remainderPaymentDate))}
            color="#2196F3"
            type="contract"
            brokerageFeeTotal={stats.thisMonthPayment.reduce((sum, c) => sum + (Number(c.brokerageFee) || 0), 0)}
            onClick={() => openModal('contract', '금월입금', stats.thisMonthPayment.sort((a, b) => new Date(a.remainderPaymentDate) - new Date(b.remainderPaymentDate)))}
          />

          {/* 다음달입금 */}
          <StatCard
            title="다음달입금"
            number={stats.nextMonthPayment.length}
            items={stats.nextMonthPayment.sort((a, b) => new Date(a.remainderPaymentDate) - new Date(b.remainderPaymentDate))}
            color="#FF9800"
            type="contract"
            brokerageFeeTotal={stats.nextMonthPayment.reduce((sum, c) => sum + (Number(c.brokerageFee) || 0), 0)}
            onClick={() => openModal('contract', '다음달입금', stats.nextMonthPayment.sort((a, b) => new Date(a.remainderPaymentDate) - new Date(b.remainderPaymentDate)))}
          />
        </div>
      )}



      {/* 오늘의 기록 & 미완료 기록 - 두 개의 패널 */}
      {activeFilter === '중개업무' && (() => {
        // 오늘 등록된 계약호실과 그들의 오늘 히스토리 필터링
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        // 오늘의 기록: 모든 항목 (필터링 없음)
        const todayHistories = [];
        // 미완료 기록: isRegistered === true && !isCompleted 항목만
        const incompleteHistories = [];

        contracts.forEach(contract => {
          if (contract.historyCards && contract.historyCards.length > 0) {
            const todayCard = contract.historyCards.find(card => {
              const cardDate = card.date.substring(0, 10);
              return cardDate === todayStr;
            });
            if (todayCard && todayCard.items && todayCard.items.length > 0) {
              todayCard.items.forEach(item => {
                if (item.content) {
                  const historyItem = {
                    contractId: contract.id,
                    buildingName: contract.buildingName,
                    roomName: contract.roomName,
                    historyContent: item.content,
                    itemId: item.id,
                    isCompleted: item.isCompleted,
                    isRegistered: item.isRegistered
                  };

                  // 오늘의 기록: 모든 항목
                  todayHistories.push(historyItem);

                  // 미완료 기록: 완료되지 않은 항목 (isRegistered 필드가 없거나 true인 경우)
                  if (!item.isCompleted && (item.isRegistered === undefined || item.isRegistered === true)) {
                    incompleteHistories.push(historyItem);
                  }
                }
              });
            }
          }
        });

        // 오늘의 기록과 미완료 기록 중 하나라도 있으면 표시 (또는 계약호실 데이터가 있으면 항상 표시)
        if (todayHistories.length === 0 && incompleteHistories.length === 0) return null;

        return (
          <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* 오늘의 기록 카드 */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '400px', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #e0e0e0' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '2px solid #4CAF50', paddingBottom: '10px', padding: '15px 20px 10px 20px', margin: '0' }}>
                📋 오늘의 기록
              </h2>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {todayHistories.length > 0 ? (
                  todayHistories.map((history, idx) => (
                    <div
                      key={idx}
                      onClick={() => onNavigate('계약호실', '전체', history.contractId, 'contract')}
                      style={{
                        padding: '12px 15px',
                        backgroundColor: '#f5f5f5',
                        borderLeft: '4px solid #2196F3',
                        borderRadius: '4px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e3f2fd';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(33, 150, 243, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <strong>{[history.buildingName, history.roomName].filter(Boolean).join(' ')}</strong>
                      <div style={{ color: '#666', marginTop: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {history.historyContent}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                    오늘의 기록이 없습니다
                  </div>
                )}
              </div>
            </div>

            {/* 미완료 기록 카드 */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '400px', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #e0e0e0' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '2px solid #FF9800', paddingBottom: '10px', padding: '15px 20px 10px 20px', margin: '0' }}>
                ⚠️ 미완료 기록
              </h2>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {incompleteHistories.length > 0 ? (
                  incompleteHistories.map((history, idx) => (
                    <div
                      key={idx}
                      onClick={() => onNavigate('계약호실', '전체', history.contractId, 'contract')}
                      style={{
                        padding: '12px 15px',
                        backgroundColor: '#fffaf0',
                        borderLeft: '4px solid #FF9800',
                        borderRadius: '4px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff3e0';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 152, 0, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fffaf0';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <strong>{[history.buildingName, history.roomName].filter(Boolean).join(' ')}</strong>
                      <div style={{ color: '#666', marginTop: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {history.historyContent}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                    미완료 기록이 없습니다
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

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
