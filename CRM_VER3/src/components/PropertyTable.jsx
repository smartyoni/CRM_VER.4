import React, { useState, useMemo } from 'react';

const PropertyTable = ({ properties, onSelectProperty, onEdit, onDelete, selectedPropertyId, activeFilter, onFilterChange, allProperties, onCloseDetailPanel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, selectedProperty: null });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // 필터 옵션 추출
  const filterOptions = ['전체', ...new Set(allProperties?.map(p => p.category).filter(Boolean) || [])];
  const propertyTypeOptions = ['전체', ...new Set(allProperties?.map(p => p.propertyType).filter(Boolean) || [])];

  const filteredProperties = useMemo(() => {
    let filtered = properties.filter(property =>
      property.buildingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.ownerPhone.includes(searchTerm)
    );

    // 정렬 적용
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // null/undefined 처리
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // 숫자 비교 (금액, 보증금, 월세)
      if (sortConfig.key === 'price' || sortConfig.key === 'deposit' || sortConfig.key === 'monthlyRent') {
        const numA = Number(aValue) || 0;
        const numB = Number(bValue) || 0;
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      // 날짜 비교 (접수일, 입주일)
      if (sortConfig.key === 'createdAt' || sortConfig.key === 'moveInDate') {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      // 문자열 비교
      const strA = String(aValue).toLowerCase();
      const strB = String(bValue).toLowerCase();

      if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [properties, searchTerm, sortConfig]);

  const handleContextMenu = (e, property) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, selectedProperty: property });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleEdit = () => {
    if (contextMenu.selectedProperty) {
      onEdit(contextMenu.selectedProperty);
    }
    handleCloseContextMenu();
  };

  const handleDelete = () => {
    if (contextMenu.selectedProperty) {
      onDelete(contextMenu.selectedProperty);
    }
    handleCloseContextMenu();
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getPropertyName = (property) => {
    return `${property.buildingName}${property.roomNumber ? ` ${property.roomNumber}` : ''}`;
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return `${Number(price).toLocaleString()}`;
  };

  // 접수일에 따른 배경색 결정
  const getBackgroundColor = (createdAt, isSelected) => {
    // 선택된 행은 기존 색상 유지
    if (isSelected) return '#e3f2fd';

    if (!createdAt) return 'transparent';

    const createdDate = new Date(createdAt);
    const today = new Date();

    // 연월 비교
    const createdYear = createdDate.getFullYear();
    const createdMonth = createdDate.getMonth();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // 월의 차이 계산
    const monthDiff = (currentYear - createdYear) * 12 + (currentMonth - createdMonth);

    if (monthDiff === 0) {
      // 당월: 핑크색
      return '#ffebee';
    } else if (monthDiff === 1) {
      // 전월: 파란색
      return '#e3f2fd';
    } else if (monthDiff >= 2 && monthDiff <= 4) {
      // 2~4개월 전: 노란색
      return '#fff9c4';
    } else {
      // 나머지 (5개월 이상): 기본색
      return 'transparent';
    }
  };

  // 즐겨찾기 토글 핸들러
  const handleFavorite = () => {
    if (contextMenu.selectedProperty) {
      onEdit(contextMenu.selectedProperty); // 수정 모달에서 즐겨찾기 토글 가능하도록
    }
    handleCloseContextMenu();
  };

  // 접수일을 M월D일 형식으로 포맷
  const formatCreatedDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월${day}일`;
  };

  // 접수일 기준 배경색
  const getDateBasedColor = (createdAt) => {
    const today = new Date();
    const createdDate = new Date(createdAt);

    const createdYear = createdDate.getFullYear();
    const createdMonth = createdDate.getMonth();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const monthDiff = (currentYear - createdYear) * 12 + (currentMonth - createdMonth);

    if (monthDiff === 0) {
      return 'rgba(255, 193, 7, 0.12)'; // 당월: 노란색
    } else if (monthDiff === 1) {
      return 'rgba(33, 150, 243, 0.12)'; // 전월: 파란색
    } else if (monthDiff >= 2 && monthDiff <= 4) {
      return 'rgba(156, 39, 176, 0.12)'; // 2~4개월: 보라색
    } else {
      return 'transparent'; // 5개월 이상
    }
  };

  // 날짜별로 rowSpan 계산
  const getDateRowSpan = (property, index) => {
    if (index > 0) {
      const prevProperty = filteredProperties[index - 1];
      if (formatCreatedDate(property.createdAt) === formatCreatedDate(prevProperty.createdAt)) {
        return 0; // 같은 날짜면 렌더링 안 함
      }
    }

    const currentDate = formatCreatedDate(property.createdAt);
    let count = 1;
    for (let i = index + 1; i < filteredProperties.length; i++) {
      if (formatCreatedDate(filteredProperties[i].createdAt) === currentDate) {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  // 특정 날짜에 추가된 매물 수
  const getPropertyCountByDate = (dateString) => {
    const formattedDate = formatCreatedDate(dateString);
    return filteredProperties.filter(p => formatCreatedDate(p.createdAt) === formattedDate).length;
  };

  const SortHeader = ({ column, label }) => (
    <th
      onClick={() => handleSort(column)}
      style={{ cursor: 'pointer', userSelect: 'none', padding: '12px', whiteSpace: 'nowrap', textAlign: 'left', fontWeight: '600' }}
    >
      {label}
      {sortConfig.key === column && (
        <span style={{ marginLeft: '8px' }}>
          {sortConfig.direction === 'asc' ? '▲' : '▼'}
        </span>
      )}
    </th>
  );

  return (
    <div className="property-table-wrapper" style={{ padding: '15px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 필터 드롭다운 */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select
          value={activeFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          {filterOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* 검색 바 */}
      <div style={{ marginBottom: '15px', position: 'relative' }}>
        <input
          type="text"
          placeholder="건물명, 소유자명, 번호로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => onCloseDetailPanel && onCloseDetailPanel()}
          style={{
            width: '100%',
            padding: '8px 12px',
            paddingRight: searchTerm ? '36px' : '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              position: 'absolute',
              right: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '4px 8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#999',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="검색 초기화"
          >
            ✕
          </button>
        )}
      </div>

{/* 테이블 */}
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
        {filteredProperties.length > 0 ? (
          <table className="customer-table" onClick={handleCloseContextMenu} style={{ fontSize: 'inherit', tableLayout: 'auto', minWidth: '1000px' }}>
            <thead>
              <tr>
                <SortHeader column="createdAt" label="접수일" />
                <SortHeader column="propertyType" label="매물유형" />
                <SortHeader column="category" label="구분" />
                <th style={{ width: '200px' }}>매물명</th>
                <SortHeader column="deposit" label="보증금" />
                <SortHeader column="monthlyRent" label="월세" />
                <SortHeader column="moveInDate" label="입주일" />
                <SortHeader column="ownerName" label="소유자" />
                <SortHeader column="ownerPhone" label="소유자번호" />
                <SortHeader column="tenantPhone" label="점주번호" />
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property, index) => {
                const rowSpan = getDateRowSpan(property, index);
                return (
                <tr
                  key={property.id}
                  onClick={() => onSelectProperty(property)}
                  onContextMenu={(e) => handleContextMenu(e, property)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: getDateBasedColor(property.createdAt),
                    fontWeight: selectedPropertyId === property.id ? 'bold' : 'normal'
                  }}
                >
                  {rowSpan > 0 && (
                    <td
                      rowSpan={rowSpan}
                      style={{
                        padding: '12px',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                        fontWeight: '500',
                        fontSize: '13px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {formatCreatedDate(property.createdAt)}({getPropertyCountByDate(property.createdAt)}건)
                    </td>
                  )}
                  <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{property.propertyType || '-'}</td>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{property.category || '-'}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{getPropertyName(property)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>{formatPrice(property.deposit || property.price)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>{formatPrice(property.monthlyRent)}</td>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{property.moveInDate ? property.moveInDate.slice(0, 10) : '-'}</td>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{property.ownerName || '-'}</td>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                    {property.ownerPhone ? (
                      <a href={`sms:${property.ownerPhone}`} style={{ color: '#2196F3', textDecoration: 'none', cursor: 'pointer' }}>
                        {property.ownerPhone}
                      </a>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                    {property.tenantPhone ? (
                      <a href={`sms:${property.tenantPhone}`} style={{ color: '#2196F3', textDecoration: 'none', cursor: 'pointer' }}>
                        {property.tenantPhone}
                      </a>
                    ) : '-'}
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            {searchTerm ? '검색 결과가 없습니다' : '등록된 매물이 없습니다'}
          </div>
        )}
      </div>

      {/* 컨텍스트 메뉴 */}
      {contextMenu.visible && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '5px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 100,
            padding: 0
          }}
        >
          <ul style={{ listStyle: 'none', margin: 0, padding: '5px' }}>
            <li
              onClick={handleEdit}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              수정
            </li>
            <li
              onClick={handleDelete}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                color: '#e74c3c'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              삭제
            </li>
            <li
              onClick={handleCloseContextMenu}
              style={{
                padding: '8px 16px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              취소
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PropertyTable;
