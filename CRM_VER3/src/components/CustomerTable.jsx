import React, { useState, useMemo } from 'react';
import { PROGRESS_STATUSES } from '../constants';

const CustomerTable = ({ customers, onSelectCustomer, onEdit, onDelete, selectedCustomerId, activeFilter, activeProgressFilter, onProgressFilterChange, allCustomers, onFavoriteCustomer }) => {
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
      // 즐겨찾기된 고객을 먼저 표시
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

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
  }, [customers, searchTerm, sortConfig]);

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

  // 매물 종류별 배경색 (파스텔톤)
  const getPropertyTypeColor = (propertyType) => {
    switch (propertyType) {
      case '매매':
        return 'rgba(229, 57, 53, 0.12)'; // 빨강 파스텔
      case '전세':
        return 'rgba(67, 160, 71, 0.12)'; // 초록/민트 파스텔
      case '월세':
        return 'rgba(255, 179, 0, 0.12)'; // 노랑/주황 파스텔
      default:
        return 'transparent';
    }
  };

  // 접수일을 M월D일 형식으로 포맷
  const formatCreatedDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월${day}일`;
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

  // 날짜별 그룹 인덱스 계산 (교차 색상용)
  const getDateGroupIndex = (customer, index) => {
    let groupIndex = 0;
    for (let i = 0; i < index; i++) {
      if (i === 0 || formatCreatedDate(filteredCustomers[i].createdAt) !== formatCreatedDate(filteredCustomers[i - 1].createdAt)) {
        groupIndex++;
      }
    }
    return groupIndex;
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

        {/* 매물 종류 색상 범례 */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', fontSize: '13px', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', color: '#555' }}>매물 종류:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: 'rgba(229, 57, 53, 0.12)', border: '1px solid rgba(229, 57, 53, 0.3)', borderRadius: '3px' }}></div>
            <span>매매</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: 'rgba(67, 160, 71, 0.12)', border: '1px solid rgba(67, 160, 71, 0.3)', borderRadius: '3px' }}></div>
            <span>전세</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: 'rgba(255, 179, 0, 0.12)', border: '1px solid rgba(255, 179, 0, 0.3)', borderRadius: '3px' }}></div>
            <span>월세</span>
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
              onClick={() => handleSort('moveInDate')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="클릭하여 정렬"
            >
              입주희망일{getSortIcon('moveInDate')}
            </th>
            <th
              onClick={() => handleSort('hopefulDeposit')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="클릭하여 정렬"
            >
              희망보증금{getSortIcon('hopefulDeposit')}
            </th>
            <th
              onClick={() => handleSort('hopefulMonthlyRent')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="클릭하여 정렬"
            >
              희망월세{getSortIcon('hopefulMonthlyRent')}
            </th>
            <th>금액 지역 상세정보</th>
            <th>매물종류</th>
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
                  backgroundColor: customer.isFavorite
                    ? 'rgba(156, 39, 176, 0.15)'
                    : getPropertyTypeColor(customer.propertyType),
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
                <td>{customer.moveInDate}</td>
                <td>{customer.hopefulDeposit ? `${customer.hopefulDeposit}만원` : '-'}</td>
                <td>{customer.hopefulMonthlyRent ? `${customer.hopefulMonthlyRent}만원` : '-'}</td>
                <td className="preferred-area" title={customer.preferredArea}>{customer.preferredArea}</td>
                <td>{customer.propertyType}</td>
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
