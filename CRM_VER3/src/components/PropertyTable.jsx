import React, { useState, useMemo } from 'react';

const PropertyTable = ({ properties, onSelectProperty, onEdit, onDelete, selectedPropertyId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, selectedProperty: null });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

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

      // 숫자 비교 (금액)
      if (sortConfig.key === 'price') {
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

  const SortHeader = ({ column, label }) => (
    <th
      onClick={() => handleSort(column)}
      style={{ cursor: 'pointer', userSelect: 'none' }}
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
      {/* 검색 바 */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="건물명, 소유자명, 번호로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            flex: 1,
            fontSize: '14px'
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            초기화
          </button>
        )}
      </div>

      {/* 테이블 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredProperties.length > 0 ? (
          <table className="customer-table" onClick={handleCloseContextMenu}>
            <thead>
              <tr>
                <SortHeader column="createdAt" label="접수일" />
                <SortHeader column="propertyType" label="매물유형" />
                <SortHeader column="category" label="구분" />
                <th style={{ width: '200px' }}>매물명</th>
                <SortHeader column="price" label="금액" />
                <SortHeader column="moveInDate" label="입주일" />
                <SortHeader column="ownerName" label="소유자" />
                <SortHeader column="ownerPhone" label="소유자번호" />
                <SortHeader column="tenantPhone" label="점주번호" />
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map(property => (
                <tr
                  key={property.id}
                  onClick={() => onSelectProperty(property)}
                  onContextMenu={(e) => handleContextMenu(e, property)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedPropertyId === property.id ? '#e3f2fd' : 'transparent',
                    fontWeight: selectedPropertyId === property.id ? 'bold' : 'normal'
                  }}
                >
                  <td style={{ fontSize: '13px' }}>{property.createdAt ? property.createdAt.slice(0, 10) : '-'}</td>
                  <td style={{ fontSize: '13px' }}>{property.propertyType || '-'}</td>
                  <td style={{ fontSize: '13px' }}>{property.category || '-'}</td>
                  <td style={{ fontSize: '13px', fontWeight: 'bold' }}>{getPropertyName(property)}</td>
                  <td style={{ fontSize: '13px', textAlign: 'right' }}>{formatPrice(property.price)}</td>
                  <td style={{ fontSize: '13px' }}>{property.moveInDate ? property.moveInDate.slice(0, 10) : '-'}</td>
                  <td style={{ fontSize: '13px' }}>{property.ownerName || '-'}</td>
                  <td style={{ fontSize: '13px' }}>{property.ownerPhone || '-'}</td>
                  <td style={{ fontSize: '13px' }}>{property.tenantPhone || '-'}</td>
                </tr>
              ))}
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
