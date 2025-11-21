import React, { useState } from 'react';
import { STATUSES, CONTRACT_PROGRESS_STATUSES, JOURNAL_CATEGORIES } from '../constants';

const FilterSidebar = ({ activeTab, activeFilter, onFilterChange, customers, meetings, activities, properties, buildings, contracts, dynamicTableData, dynamicTables, isMobileOpen, onMobileClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getLastActivityDate = (customerId) => {
    const customerActivities = activities.filter(a => a.customerId === customerId);
    if (customerActivities.length === 0) return null;
    const sorted = customerActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    return new Date(sorted[0].date);
  };

  const getDaysDiff = (date1, date2) => {
    const diff = Math.abs(date1 - date2);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusCount = (status) => {
    // 동적 테이블 필터 (카테고리 기반)
    const isDynamicTable = dynamicTables && dynamicTables.some(t => t.id === activeTab);
    if (isDynamicTable && dynamicTableData && dynamicTableData[activeTab]) {
      const tableData = dynamicTableData[activeTab];

      // 카테고리별 개수 세기 (category 필드 사용)
      if (status === '전체') {
        return tableData.length;
      }
      // 미분류: category가 없거나 빈 값인 데이터
      if (status === '미분류') {
        return tableData.filter(row => !row.category || row.category.trim() === '').length;
      }
      return tableData.filter(row => row.category === status).length;
    }

    // 고객목록 필터
    if (activeTab === '고객관리') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (status === '전체') return customers.length;

      // 미팅 기반 필터
      if (status === '즐겨찾기') {
        return customers.filter(c => c.isFavorite).length;
      }

      if (status === '오늘미팅') {
        return customers.filter(c => {
          const customerMeetings = meetings.filter(m => m.customerId === c.id);
          return customerMeetings.some(m => {
            const meetingDate = new Date(m.date);
            meetingDate.setHours(0, 0, 0, 0);
            return meetingDate.getTime() === today.getTime();
          });
        }).length;
      }
      if (status === '미팅일확정') {
        return customers.filter(c => {
          const customerMeetings = meetings.filter(m => m.customerId === c.id);
          return customerMeetings.some(m => {
            const meetingDate = new Date(m.date);
            meetingDate.setHours(0, 0, 0, 0);
            return meetingDate > today;
          });
        }).length;
      }

      // 활동 기록이 있는데 답장이 없는 고객
      if (status === '답장대기') {
        return customers.filter(c => {
          const customerActivities = activities.filter(a => a.customerId === c.id);
          if (customerActivities.length === 0) return false; // 활동 기록이 없으면 제외

          // 모든 활동에 대해 "답장"이 없는지 확인
          return customerActivities.some(activity => {
            const followUps = activity.followUps || [];
            // 이 활동에 "답장"이 없으면 true
            return !followUps.some(followUp => followUp.author === '답장');
          });
        }).length;
      }

      // 오늘 활동 기록이 있는 고객
      if (status === '오늘활동') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return customers.filter(c => {
          const customerActivities = activities.filter(a => a.customerId === c.id);
          return customerActivities.some(activity => {
            const activityDate = new Date(activity.date);
            activityDate.setHours(0, 0, 0, 0);
            return activityDate.getTime() === today.getTime();
          });
        }).length;
      }

      return customers.filter(c => c.status === status).length;
    } else if (activeTab === '계약호실') {
      // 계약호실 필터
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (status === '전체') return contracts?.length || 0;

      // "계약서작성" 필터: 계약서작성일이 오늘 이후
      if (status === '계약서작성') {
        return contracts?.filter(c => {
          if (!c.contractDate) return false;

          const contractDate = new Date(c.contractDate);
          contractDate.setHours(0, 0, 0, 0);

          return contractDate >= today;
        }).length || 0;
      }

      // "잔금" 필터: 진행상황이 '잔금'이고 잔금일이 오늘 이후
      if (status === '잔금') {
        return contracts?.filter(c => {
          if (c.progressStatus !== '잔금') return false;
          if (!c.balanceDate) return false;

          const balanceDate = new Date(c.balanceDate);
          balanceDate.setHours(0, 0, 0, 0);

          return balanceDate >= today;
        }).length || 0;
      }

      // "금월계약" 필터: 계약서작성일이 이번 달
      if (status === '금월계약') {
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        return contracts?.filter(c => {
          if (!c.contractDate) return false;

          const contractDate = new Date(c.contractDate);
          return (
            contractDate.getFullYear() === currentYear &&
            contractDate.getMonth() === currentMonth
          );
        }).length || 0;
      }

      // "금월잔금" 필터: 잔금일이 이번 달
      if (status === '금월잔금') {
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        return contracts?.filter(c => {
          if (!c.balanceDate) return false;

          const balanceDate = new Date(c.balanceDate);
          return (
            balanceDate.getFullYear() === currentYear &&
            balanceDate.getMonth() === currentMonth
          );
        }).length || 0;
      }

      // "전월입금" 필터: 입금일이 전달
      if (status === '전월입금') {
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const previousYear = previousMonthDate.getFullYear();
        const previousMonth = previousMonthDate.getMonth();

        return contracts?.filter(c => {
          if (!c.remainderPaymentDate) return false;

          const paymentDate = new Date(c.remainderPaymentDate);
          return (
            paymentDate.getFullYear() === previousYear &&
            paymentDate.getMonth() === previousMonth
          );
        }).length || 0;
      }

      // "금월입금" 필터: 입금일이 이번 달
      if (status === '금월입금') {
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        return contracts?.filter(c => {
          if (!c.remainderPaymentDate) return false;

          const paymentDate = new Date(c.remainderPaymentDate);
          return (
            paymentDate.getFullYear() === currentYear &&
            paymentDate.getMonth() === currentMonth
          );
        }).length || 0;
      }

      // "다음달입금" 필터: 입금일이 다음달
      if (status === '다음달입금') {
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
        const nextYear = nextMonthDate.getFullYear();
        const nextMonth = nextMonthDate.getMonth();

        return contracts?.filter(c => {
          if (!c.remainderPaymentDate) return false;

          const paymentDate = new Date(c.remainderPaymentDate);
          return (
            paymentDate.getFullYear() === nextYear &&
            paymentDate.getMonth() === nextMonth
          );
        }).length || 0;
      }

      // 해당 진행상황의 계약호실 개수
      return contracts?.filter(c => c.progressStatus === status).length || 0;
    } else if (activeTab === '대시보드') {
      // 대시보드 필터
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (status === '고객관리') {
        // 고객관리 필터에 표시되는 카드의 개수: 3개 (계약예정, 잔금예정, 미팅예정)
        return 3;
      }

      return 0;
    }
  };

  // activeTab에 따라 다른 필터 목록 표시
  const isDynamicTable = dynamicTables && dynamicTables.some(t => t.id === activeTab);
  const allStatuses = (() => {
    if (isDynamicTable && dynamicTableData && dynamicTableData[activeTab]) {
      // 일지 테이블인 경우 JOURNAL_CATEGORIES의 모든 항목 표시
      const tableMetadata = dynamicTables.find(t => t.id === activeTab);
      // 동적 테이블 이름에 "일지"가 포함되어 있거나, category 필드가 있는 경우
      const hasCategory = dynamicTableData[activeTab]?.some(row => row.hasOwnProperty('category'));

      if (hasCategory && (tableMetadata?.name?.includes('일지') || tableMetadata?.name?.includes('journal'))) {
        // 모든 카테고리 포함 (JOURNAL_CATEGORIES 사용) + 미분류
        return ['전체', '미분류', ...JOURNAL_CATEGORIES];
      }
    }

    if (activeTab === '고객관리') {
      return ['전체', '오늘활동', '오늘미팅', '미팅일확정', '즐겨찾기', '답장대기', '보류'];
    } else if (activeTab === '계약호실') {
      return ['전체', '금월계약', '금월잔금', '전월입금', '금월입금', '다음달입금'];
    } else if (activeTab === '대시보드') {
      return ['고객관리'];
    }
    return [];
  })();

  const handleFilterClick = (status) => {
    onFilterChange(status);
    onMobileClose(); // 모바일에서 필터 선택 시 사이드바 닫기
  };

  return (
    <aside className={`filter-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="filter-header">
        {!isCollapsed && <h4>필터</h4>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="btn-close desktop-only">
          {isCollapsed ? '☰' : '✕'}
        </button>
        <button onClick={onMobileClose} className="btn-close mobile-only">
          ✕
        </button>
      </div>
      {!isCollapsed && (
        <ul className="filter-list">
          {allStatuses.map(status => (
            <li
              key={status}
              className={`filter-item ${activeFilter === status ? 'active' : ''}`}
              onClick={() => handleFilterClick(status)}
            >
              <span>{status}</span>
              <span className="count-badge">{getStatusCount(status)}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default FilterSidebar;
