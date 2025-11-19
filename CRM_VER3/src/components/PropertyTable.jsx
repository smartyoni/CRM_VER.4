import React, { useState, useMemo } from 'react';

const PropertyTable = ({
  properties,
  onSelectProperty,
  onEdit,
  onDelete,
  selectedPropertyId,
  onCloseDetailPanel
}) => {
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

      // 숫자 비교
      if (sortConfig.key === 'price' || sortConfig.key === 'deposit' || sortConfig.key === 'monthlyRent') {
        const numA = Number(aValue) || 0;
        const numB = Number(bValue) || 0;
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      // 날짜 비교
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
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, selectedProperty: property });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleEdit = () => {
    if (contextMenu.selectedProperty) {
      onEdit(contextMenu.selectedProperty);
      handleCloseContextMenu();
    }
  };

  const handleDelete = () => {
    if (contextMenu.selectedProperty && confirm('이 매물을 삭제하겠습니까?')) {
      onDelete(contextMenu.selectedProperty);
      handleCloseContextMenu();
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getPropertyName = (property) => {
    return `${property.buildingName}${property.roomNumber ? ` ${property.roomNumber}` : ''}`;
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return `${Number(price).toLocaleString()}`;
  };

  // TableHeader 컴포넌트
  const TableHeader = ({ column, label }) => (
    <th
      onClick={() => handleSort(column)}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        padding: '12px',
        whiteSpace: 'nowrap',
        textAlign: 'left',
        fontWeight: '600'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {label}
        {sortConfig.key === column && (
          <span style={{ fontSize: '12px' }}>
            {sortConfig.direction === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div className="property-table-container" style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      padding: '20px'
    }}>
      {/* 검색 바 */}
      <div style={{ position: 'relative' }}>
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
      <div style={{ flex: 1, overflowX: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
        {filteredProperties.length > 0 ? (
          <table className="customer-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <TableHeader column="createdAt" label="접수일" />
                <TableHeader column="propertyType" label="매물유형" />
                <TableHeader column="category" label="구분" />
                <th style={{ padding: '12px', whiteSpace: 'nowrap', textAlign: 'left', fontWeight: '600' }}>
                  매물명
                </th>
                <TableHeader column="deposit" label="보증금" />
                <TableHeader column="monthlyRent" label="월세" />
                <TableHeader column="moveInDate" label="입주일" />
                <TableHeader column="ownerName" label="소유자" />
                <th style={{ padding: '12px', whiteSpace: 'nowrap', textAlign: 'left', fontWeight: '600' }}>
                  소유자번호
                </th>
                <th style={{ padding: '12px', whiteSpace: 'nowrap', textAlign: 'left', fontWeight: '600' }}>
                  점주번호
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property, index) => (
                <tr
                  key={property.id}
                  onClick={() => onSelectProperty(property)}
                  onContextMenu={(e) => handleContextMenu(e, property)}
                  style={{
                    backgroundColor: selectedPropertyId === property.id
                      ? '#e3f2fd'
                      : index % 2 === 0 ? '#ffffff' : '#f5f5f5',
                    cursor: 'pointer',
                    borderBottom: '1px solid #e0e0e0',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPropertyId !== property.id) {
                      e.currentTarget.style.backgroundColor = '#dcfce7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPropertyId !== property.id) {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f5f5f5';
                    }
                  }}
                >
                  <td style={{ padding: '12px' }}>
                    {new Date(property.createdAt).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td style={{ padding: '12px' }}>{property.propertyType || '-'}</td>
                  <td style={{ padding: '12px' }}>{property.category || '-'}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{getPropertyName(property)}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{formatPrice(property.deposit || property.price)}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{formatPrice(property.monthlyRent)}</td>
                  <td style={{ padding: '12px' }}>{property.moveInDate ? property.moveInDate.slice(0, 10) : '-'}</td>
                  <td style={{ padding: '12px' }}>{property.ownerName || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    {property.ownerPhone ? (
                      <a href={`sms:${property.ownerPhone}`} style={{ color: '#2196F3', textDecoration: 'none' }}>
                        {property.ownerPhone}
                      </a>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {property.tenantPhone ? (
                      <a href={`sms:${property.tenantPhone}`} style={{ color: '#2196F3', textDecoration: 'none' }}>
                        {property.tenantPhone}
                      </a>
                    ) : '-'}
                  </td>
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
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998
            }}
            onClick={handleCloseContextMenu}
          />
          <div
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 999,
              minWidth: '120px'
            }}
          >
            <button
              onClick={handleEdit}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#333',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#d32f2f',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#ffebee'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              삭제
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PropertyTable;
