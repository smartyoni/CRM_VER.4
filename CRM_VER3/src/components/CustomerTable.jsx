import React, { useState, useMemo } from 'react';
import { useColumnResize } from '../hooks/useColumnResize';

const CustomerTable = ({
  customers,
  onSelectCustomer,
  onEdit,
  onDelete,
  selectedCustomerId,
  activeFilter,
  activeProgressFilter,
  onProgressFilterChange,
  allCustomers,
  onCloseDetailPanel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, selectedCustomer: null });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // 컬럼 리사이징
  const defaultColumns = [
    { id: 'createdAt', width: 120 },
    { id: 'name', width: 150 },
    { id: 'phone', width: 140 },
    { id: 'memo', width: 300 }
  ];
  const { columnWidths, ResizeHandle } = useColumnResize('customer', defaultColumns);

  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
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
      if (sortConfig.key === 'hopefulDeposit' || sortConfig.key === 'hopefulMonthlyRent') {
        const numA = Number(aValue) || 0;
        const numB = Number(bValue) || 0;
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      // 문자열/날짜 비교
      const strA = String(aValue).toLowerCase();
      const strB = String(bValue).toLowerCase();

      if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [customers, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleContextMenu = (e, customer) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, selectedCustomer: customer });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleEdit = () => {
    if (contextMenu.selectedCustomer) {
      onEdit(contextMenu.selectedCustomer);
      handleCloseContextMenu();
    }
  };

  const handleDelete = () => {
    if (contextMenu.selectedCustomer && confirm('이 고객을 삭제하겠습니까?')) {
      onDelete(contextMenu.selectedCustomer);
      handleCloseContextMenu();
    }
  };

  // TableHeader 컴포넌트
  const TableHeader = ({ label, sortKey, className, columnId }) => (
    <th
      className={className}
      onClick={() => handleSort(sortKey)}
      style={{
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        padding: '12px',
        whiteSpace: 'nowrap',
        textAlign: 'left',
        fontWeight: '600',
        width: columnWidths[columnId],
        minWidth: '50px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {label}
        {sortConfig.key === sortKey && (
          <span style={{ fontSize: '12px' }}>
            {sortConfig.direction === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </div>
      <ResizeHandle columnId={columnId} currentWidth={columnWidths[columnId]} />
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
          placeholder="고객명, 연락처 검색..."
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
        {filteredCustomers.length > 0 ? (
          <table className="customer-table" style={{ width: '100%', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <TableHeader label="접수일" sortKey="createdAt" className="col-date-standard" columnId="createdAt" />
                <TableHeader label="고객명" sortKey="name" className="col-text-standard" columnId="name" />
                <th className="col-phone-standard" style={{ position: 'relative', padding: '12px', whiteSpace: 'nowrap', textAlign: 'left', fontWeight: '600', width: columnWidths['phone'], minWidth: '50px' }}>
                  연락처
                  <ResizeHandle columnId="phone" currentWidth={columnWidths['phone']} />
                </th>
                <th className="col-expand" style={{ position: 'relative', padding: '12px', whiteSpace: 'nowrap', textAlign: 'left', fontWeight: '600' }}>
                  활동내용
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => (
                <tr
                  key={customer.id}
                  onClick={() => onSelectCustomer(customer)}
                  onContextMenu={(e) => handleContextMenu(e, customer)}
                  style={{
                    backgroundColor: selectedCustomerId === customer.id
                      ? '#e3f2fd'
                      : index % 2 === 0 ? '#ffffff' : '#f5f5f5',
                    cursor: 'pointer',
                    borderBottom: '1px solid #e0e0e0',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCustomerId !== customer.id) {
                      e.currentTarget.style.backgroundColor = '#dcfce7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCustomerId !== customer.id) {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f5f5f5';
                    }
                  }}
                >
                  <td className="col-date-standard" style={{ padding: '12px', width: columnWidths['createdAt'], overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {new Date(customer.createdAt).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="col-text-standard" style={{ padding: '12px', width: columnWidths['name'], overflow: 'hidden', textOverflow: 'ellipsis' }}>{customer.name}</td>
                  <td className="col-phone-standard" style={{ padding: '12px', width: columnWidths['phone'], overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <a href={`sms:${customer.phone}`} style={{ textDecoration: 'none', color: '#2196F3' }}>
                      {customer.phone}
                    </a>
                  </td>
                  <td className="col-expand" style={{ padding: '12px', fontSize: '13px', color: '#666' }}>
                    {customer.memo || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            {searchTerm ? '검색 결과가 없습니다' : '등록된 고객이 없습니다'}
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

export default CustomerTable;
