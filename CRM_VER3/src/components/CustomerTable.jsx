import React, { useState, useMemo } from 'react';
import { PROGRESS_STATUSES } from '../constants';

const CustomerTable = ({ customers, onSelectCustomer, onEdit, onDelete, selectedCustomerId, activeFilter, activeProgressFilter, onProgressFilterChange, allCustomers, onFavoriteCustomer, activities, meetings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, selectedCustomer: null });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    );

    // 정렬 적용
    const sorted = [...filtered].sort((a, b) => {
      // 장기관리고객을 보류 바로 위로 이동
      if (a.status === '장기관리' && b.status !== '장기관리') return 1;
      if (a.status !== '장기관리' && b.status === '장기관리') return -1;

      // 보류 고객을 가장 아래로 이동
      if (a.status === '보류' && b.status !== '보류') return 1;
      if (a.status !== '보류' && b.status === '보류') return -1;

      // 즐겨찾기된 고객을 먼저 표시
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      // 활동일 정렬 처리
      if (sortConfig.key === 'latestActivityDate') {
        const aActivities = activities.filter(act => act.customerId === a.id).sort((x, y) => new Date(y.date) - new Date(x.date));
        const bActivities = activities.filter(act => act.customerId === b.id).sort((x, y) => new Date(y.date) - new Date(x.date));

        const aDate = aActivities.length > 0 ? new Date(aActivities[0].date) : new Date(0);
        const bDate = bActivities.length > 0 ? new Date(bActivities[0].date) : new Date(0);

        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }

      // 미팅일 정렬 처리
      if (sortConfig.key === 'latestMeetingDate') {
        const aMeetings = meetings.filter(m => m.customerId === a.id).sort((x, y) => new Date(y.date) - new Date(x.date));
        const bMeetings = meetings.filter(m => m.customerId === b.id).sort((x, y) => new Date(y.date) - new Date(x.date));

        const aDate = aMeetings.length > 0 ? new Date(aMeetings[0].date) : new Date(0);
        const bDate = bMeetings.length > 0 ? new Date(bMeetings[0].date) : new Date(0);

        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }

      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // null/undefined 처리
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // 숫자 비교 (보증금, 월세)
      if (sortConfig.key === 'hopefulDeposit' || sortConfig.key === 'hopefulMonthlyRent') {
        const numA = Number(aValue) || 0;
        const numB = Number(bValue) || 0;
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      // 문자열 비교 (고객명, 입주희망일)
      const strA = String(aValue).toLowerCase();
      const strB = String(bValue).toLowerCase();

      if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [customers, searchTerm, sortConfig, activities, meetings]);

  const handleContextMenu = (e, customer) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, selectedCustomer: customer });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleFavorite = () => {
    if (contextMenu.selectedCustomer) {
      onFavoriteCustomer(contextMenu.selectedCustomer);
    }
    handleCloseContextMenu();
  };

  // 진행상황별 고객 수 계산 (현재 선택된 상태에 해당하는 고객만)
  const getProgressCount = (progress) => {
    return allCustomers.filter(c =>
      (activeFilter === '전체' || c.status === activeFilter) && c.progress === progress
    ).length;
  };

  // 진행상황 탭을 표시할지 여부
  const showProgressTabs = activeFilter === '신규' || activeFilter === '진행중';

  // 정렬 핸들러
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 정렬 아이콘 표시
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  // 접수일 기준 배경색 (오늘=보라, 과거 홀수=핑크, 과거 짝수=초록)
  const getDateBasedColor = (createdAt, dateGroupIndex) => {
    // 오늘 날짜 계산
    const today = new Date();
    const customerDate = new Date(createdAt);
    const isToday =
      today.getFullYear() === customerDate.getFullYear() &&
      today.getMonth() === customerDate.getMonth() &&
      today.getDate() === customerDate.getDate();

    // 오늘 접수되면 보라색 반환
    if (isToday) {
      return 'rgba(156, 39, 176, 0.12)'; // 보라 파스텔
    }

    // 과거 날짜: 홀수 그룹=핑크, 짝수 그룹=초록
    return dateGroupIndex % 2 === 0
      ? 'rgba(67, 160, 71, 0.12)'   // 초록 파스텔
      : 'rgba(229, 57, 53, 0.12)';   // 핑크 파스텔
  };

  // 접수일을 M월D일 형식으로 포맷
  const formatCreatedDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월${day}일`;
  };

  // 가장 최근의 활동일 조회 (일자만 표기)
  const getLatestActivityDate = (customerId) => {
    const customerActivities = activities
      .filter(a => a.customerId === customerId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (customerActivities.length === 0) return '활동필요';

    const latestActivity = customerActivities[0];
    const date = new Date(latestActivity.date);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월${day}일`;
  };

  // 가장 최근의 활동 내용 조회 (30글자까지)
  const getLatestActivityContent = (customerId) => {
    const customerActivities = activities
      .filter(a => a.customerId === customerId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (customerActivities.length === 0) return '-';

    const latestActivity = customerActivities[0];
    const content = latestActivity.content || '-';

    // 30글자까지만 표시
    if (content.length > 30) {
      return content.substring(0, 30) + '...';
    }
    return content;
  };

  // 가장 최근의 미팅일 조회 및 오늘 미팅 여부 확인
  const getLatestMeetingDate = (customerId) => {
    const customerMeetings = meetings
      .filter(m => m.customerId === customerId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (customerMeetings.length === 0) return '-';

    const latestMeeting = customerMeetings[0];
    const date = new Date(latestMeeting.date);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 오늘 미팅인지 확인
    const today = new Date();
    const isToday =
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate();

    if (isToday) {
      return { text: '*오늘미팅*', isToday: true };
    }

    return { text: `${month}월${day}일`, isToday: false };
  };

  // 미팅 횟수 조회 (예정된 미팅 / 진행한 미팅)
  const getMeetingCount = (customerId) => {
    const customerMeetings = meetings.filter(m => m.customerId === customerId);

    if (customerMeetings.length === 0) return '-';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘 포함 앞으로 예정된 미팅
    const upcomingMeetings = customerMeetings.filter(m => {
      const meetingDate = new Date(m.date);
      meetingDate.setHours(0, 0, 0, 0);
      return meetingDate >= today;
    });

    // 이전에 진행한 미팅
    const pastMeetings = customerMeetings.filter(m => {
      const meetingDate = new Date(m.date);
      meetingDate.setHours(0, 0, 0, 0);
      return meetingDate < today;
    });

    return `${upcomingMeetings.length}/${pastMeetings.length}`;
  };

  // 활동일 색상 결정
  const getActivityDateColor = (customerId) => {
    const customerActivities = activities
      .filter(a => a.customerId === customerId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (customerActivities.length === 0) return '#e53935'; // 경고 색상 (진한 빨강)

    const latestActivity = customerActivities[0];
    const today = new Date();
    const activityDate = new Date(latestActivity.date);
    const daysAgo = Math.floor((today - activityDate) / (1000 * 60 * 60 * 24));

    // 오늘
    if (
      today.getFullYear() === activityDate.getFullYear() &&
      today.getMonth() === activityDate.getMonth() &&
      today.getDate() === activityDate.getDate()
    ) {
      return '#ff0000'; // 빨간색
    }

    // 1일, 2일, 3일 전
    if (daysAgo >= 1 && daysAgo <= 3) {
      return '#0000ff'; // 파란색
    }

    // 4일, 5일, 6일, 7일 전
    if (daysAgo >= 4 && daysAgo <= 7) {
      return '#ff9800'; // 노란색
    }

    // 8일 이상
    if (daysAgo >= 8) {
      return '#999999'; // 회색
    }

    return 'inherit'; // 기본 색상
  };

  // 특정 날짜에 접수된 고객 수 계산
  const getCustomerCountByDate = (dateString) => {
    const formattedDate = formatCreatedDate(dateString);
    return filteredCustomers.filter(c => formatCreatedDate(c.createdAt) === formattedDate).length;
  };

  // 같은 날짜의 고객이 연속으로 몇 명인지 계산 (rowspan 용)
  const getDateRowSpan = (customer, index) => {
    // 이전 고객과 같은 날짜면 0 반환 (셀 렌더링 안 함)
    if (index > 0) {
      const prevCustomer = filteredCustomers[index - 1];
      if (formatCreatedDate(customer.createdAt) === formatCreatedDate(prevCustomer.createdAt)) {
        return 0;
      }
    }

    // 같은 날짜의 고객 수 계산
    const currentDate = formatCreatedDate(customer.createdAt);
    let count = 1;
    for (let i = index + 1; i < filteredCustomers.length; i++) {
      if (formatCreatedDate(filteredCustomers[i].createdAt) === currentDate) {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  // 날짜별 그룹 인덱스 계산 (과거 날짜가 변경될 때마다 교차)
  const getDateGroupIndex = (customer, index) => {
    const today = new Date();
    const isToday =
      today.getFullYear() === new Date(customer.createdAt).getFullYear() &&
      today.getMonth() === new Date(customer.createdAt).getMonth() &&
      today.getDate() === new Date(customer.createdAt).getDate();

    // 오늘이면 -1 반환 (특수 처리)
    if (isToday) {
      return -1;
    }

    // 과거 날짜의 경우, 처음 만난 과거 날짜부터 카운트
    let pastDateGroupIndex = 0;
    let lastPastDate = null;

    for (let i = 0; i <= index; i++) {
      const iToday =
        today.getFullYear() === new Date(filteredCustomers[i].createdAt).getFullYear() &&
        today.getMonth() === new Date(filteredCustomers[i].createdAt).getMonth() &&
        today.getDate() === new Date(filteredCustomers[i].createdAt).getDate();

      // 오늘이 아닌 과거 날짜만 처리
      if (!iToday) {
        const currentDate = formatCreatedDate(filteredCustomers[i].createdAt);

        if (lastPastDate === null) {
          lastPastDate = currentDate;
          pastDateGroupIndex = 0;
        } else if (lastPastDate !== currentDate) {
          // 날짜가 변경되면 인덱스 증가
          lastPastDate = currentDate;
          pastDateGroupIndex++;
        }
      }
    }

    return pastDateGroupIndex;
  };

  // 날짜 셀 배경색 (교차)
  const getDateCellColor = (groupIndex) => {
    return groupIndex % 2 === 0 ? '#fafafa' : '#f0f4ff';
  };

  // 날짜 그룹 간 여백 스타일 계산
  const getDateGroupSpacingStyle = (customer, index) => {
    if (index === 0) return {};

    const currentDate = formatCreatedDate(customer.createdAt);
    const prevDate = formatCreatedDate(filteredCustomers[index - 1].createdAt);

    // 이전 고객과 날짜가 다르면 여백 추가
    if (prevDate !== currentDate) {
      return {
        borderTop: '12px solid white'
      };
    }

    return {};
  };

  return (
    <div className="table-container" onClick={handleCloseContextMenu}>
        <div style={{ marginBottom: '15px' }}>
            <input
                type="text"
                placeholder="고객명, 연락처 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px' }}
            />
        </div>

        {/* 색상 범례 */}
        <div style={{ display: 'flex', gap: '30px', marginBottom: '15px', fontSize: '13px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* 접수일 범례 */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: '#555' }}>접수일:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: 'rgba(156, 39, 176, 0.12)', border: '1px solid rgba(156, 39, 176, 0.3)', borderRadius: '3px' }}></div>
              <span>오늘</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: 'rgba(229, 57, 53, 0.12)', border: '1px solid rgba(229, 57, 53, 0.3)', borderRadius: '3px' }}></div>
              <span>과거 (홀수)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: 'rgba(67, 160, 71, 0.12)', border: '1px solid rgba(67, 160, 71, 0.3)', borderRadius: '3px' }}></div>
              <span>과거 (짝수)</span>
            </div>
          </div>

          {/* 활동일 범례 */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: '#555' }}>활동일:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#ff0000', borderRadius: '3px' }}></div>
              <span>오늘</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#0000ff', borderRadius: '3px' }}></div>
              <span>1~3일</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#ff9800', borderRadius: '3px' }}></div>
              <span>4~7일</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#999999', borderRadius: '3px' }}></div>
              <span>8일 이상</span>
            </div>
          </div>
        </div>

        {showProgressTabs && (
          <div className="progress-tabs" style={{ marginBottom: '15px' }}>
            <button
              className={`progress-tab ${!activeProgressFilter ? 'active' : ''}`}
              onClick={() => onProgressFilterChange(null)}
            >
              전체 ({allCustomers.filter(c => activeFilter === '전체' || c.status === activeFilter).length})
            </button>
            {PROGRESS_STATUSES.map(progress => (
              <button
                key={progress}
                className={`progress-tab ${activeProgressFilter === progress ? 'active' : ''} progress-${progress}`}
                onClick={() => onProgressFilterChange(progress)}
              >
                {progress} ({getProgressCount(progress)})
              </button>
            ))}
          </div>
        )}
      <table className="customer-table">
        <thead>
          <tr>
            <th
              onClick={() => handleSort('createdAt')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="클릭하여 정렬"
            >
              접수일{getSortIcon('createdAt')}
            </th>
            <th
              onClick={() => handleSort('name')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="클릭하여 정렬"
            >
              고객명{getSortIcon('name')}
            </th>
            <th>연락처</th>
            <th
              onClick={() => handleSort('latestActivityDate')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="클릭하여 정렬"
            >
              활동일{getSortIcon('latestActivityDate')}
            </th>
            <th>활동내용</th>
            <th
              onClick={() => handleSort('latestMeetingDate')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="클릭하여 정렬"
            >
              미팅일{getSortIcon('latestMeetingDate')}
            </th>
            <th>미팅횟수</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((customer, index) => {
            const rowSpan = getDateRowSpan(customer, index);
            const dateGroupIndex = getDateGroupIndex(customer, index);
            const spacingStyle = getDateGroupSpacingStyle(customer, index);
            return (
              <tr
                key={customer.id}
                className={selectedCustomerId === customer.id ? 'selected' : ''}
                onClick={() => onSelectCustomer(customer)}
                onContextMenu={(e) => handleContextMenu(e, customer)}
                style={{
                  backgroundColor: customer.status === '보류'
                    ? '#f0f0f0'
                    : customer.status === '장기관리'
                    ? '#fff3e0'
                    : customer.isFavorite
                    ? 'rgba(156, 39, 176, 0.15)'
                    : getDateBasedColor(customer.createdAt, dateGroupIndex),
                  borderLeft: customer.isFavorite ? '3px solid #9C27B0' : 'none',
                  boxShadow: customer.isFavorite ? '0 2px 4px rgba(156, 39, 176, 0.3)' : 'none',
                  ...spacingStyle
                }}
              >
                {rowSpan > 0 && (
                  <td
                    rowSpan={rowSpan}
                    style={{
                      verticalAlign: 'middle',
                      textAlign: 'center',
                      backgroundColor: getDateCellColor(dateGroupIndex),
                      fontWeight: '500'
                    }}
                  >
                    {formatCreatedDate(customer.createdAt)}({getCustomerCountByDate(customer.createdAt)}명)
                  </td>
                )}
                <td className="customer-name" title={customer.name}>
                  {customer.isFavorite && <span style={{ marginRight: '6px', color: '#9C27B0' }}>⭐</span>}
                  {customer.name}
                </td>
                <td><a href={`sms:${customer.phone}`}>{customer.phone}</a></td>
                <td style={{ color: getActivityDateColor(customer.id), fontWeight: getActivityDateColor(customer.id) !== 'inherit' ? 'bold' : 'normal' }}>
                  {getLatestActivityDate(customer.id)}
                </td>
                <td title={getLatestActivityContent(customer.id) !== '-' ? getLatestActivityContent(customer.id) : ''}>{getLatestActivityContent(customer.id)}</td>
                <td style={{
                  color: getLatestMeetingDate(customer.id) !== '-' && getLatestMeetingDate(customer.id).isToday ? '#ff0000' : 'inherit',
                  fontWeight: getLatestMeetingDate(customer.id) !== '-' && getLatestMeetingDate(customer.id).isToday ? 'bold' : 'normal'
                }}>
                  {getLatestMeetingDate(customer.id) === '-' ? '-' : getLatestMeetingDate(customer.id).text}
                </td>
                <td>{getMeetingCount(customer.id)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {contextMenu.visible && (
        <div style={{ top: contextMenu.y, left: contextMenu.x, position: 'absolute', zIndex: 100, background: 'white', border: '1px solid #ccc', borderRadius: '5px', padding: '5px' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: '5px' }}>
            <li style={{ padding: '8px', cursor: 'pointer' }} onClick={handleFavorite}>
              {contextMenu.selectedCustomer?.isFavorite ? '⭐ 즐겨찾기 취소' : '☆ 즐겨찾기 추가'}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomerTable;
