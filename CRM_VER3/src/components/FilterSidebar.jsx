import React, { useState } from 'react';
import { STATUSES } from '../constants';

const FilterSidebar = ({ activeTab, activeFilter, onFilterChange, customers, meetings, activities, properties, isMobileOpen, onMobileClose }) => {
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
    // 고객목록 필터
    if (activeTab === '고객목록') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (status === '전체') return customers.length;

      // 미팅 기반 필터
      if (status === '집중고객') {
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

      return customers.filter(c => c.status === status).length;
    } else {
      // 매물장 필터
      if (status === '전체') return properties.length;
      // 추가 매물 필터는 사용자 요청에 따라 추가 예정
      return 0;
    }
  };

  // activeTab에 따라 다른 필터 목록 표시
  const allStatuses = activeTab === '고객목록'
    ? ['전체', '보류', '신규', '진행중', '집중고객', '오늘미팅', '미팅일확정', '답장대기']
    : ['전체']; // 매물장 필터 (사용자가 나중에 추가 예정)

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
