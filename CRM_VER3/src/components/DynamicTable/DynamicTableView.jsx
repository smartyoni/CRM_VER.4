import React, { useState, useMemo } from 'react';

const DynamicTableView = ({
  tableData = [],
  tableMetadata = null,
  onSelectRow = () => {},
  onEdit = () => {},
  onDelete = () => {},
  selectedRowId = null,
  onCloseDetailPanel = () => {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [contextMenu, setContextMenu] = useState(null);

  if (!tableMetadata) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        테이블 정보를 로드할 수 없습니다.
      </div>
    );
  }

  const columns = tableMetadata.columns || [];
  const displayColumns = columns.filter(col => col.display !== false);

  // 검색 및 정렬 로직
  const filteredAndSortedData = useMemo(() => {
    let filtered = tableData;

    // 검색 필터링
    if (searchTerm.trim()) {
      filtered = tableData.filter(row =>
        displayColumns.some(col =>
          String(row[col.name] || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // 정렬
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        let comparison = 0;
        if (aVal === null || aVal === undefined) {
          comparison = 1;
        } else if (bVal === null || bVal === undefined) {
          comparison = -1;
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else {
          comparison = String(aVal).localeCompare(String(bVal), 'ko-KR');
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [tableData, searchTerm, sortColumn, sortOrder, displayColumns]);

  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortOrder('desc');
    }
  };

  const handleContextMenu = (e, row) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      row
    });
  };

  const handleRowClick = (row) => {
    onSelectRow(row);
  };

  const renderCellValue = (value, columnType) => {
    if (value === null || value === undefined || value === '') {
      return <span style={{ color: '#999' }}>-</span>;
    }

    switch (columnType) {
      case 'date':
        return new Date(value).toLocaleDateString('ko-KR');
      case 'number':
        return Number(value).toLocaleString('ko-KR');
      default:
        return String(value);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 검색바 */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', padding: '0 20px', paddingTop: '20px' }}>
        <input
          type="text"
          placeholder={`${tableMetadata.name}에서 검색...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={onCloseDetailPanel}
          style={{
            flex: 1,
            padding: '10px 12px',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              padding: '10px 16px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            초기화
          </button>
        )}
      </div>

      {/* 테이블 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        {filteredAndSortedData.length > 0 ? (
          <table className="customer-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                {displayColumns.map((col, colIndex) => {
                  const isLastColumn = colIndex === displayColumns.length - 1;
                  let columnClass = '';

                  // 컬럼 타입별 클래스 지정
                  if (col.type === 'date') {
                    columnClass = 'col-date-standard';
                  } else if (col.type === 'number') {
                    columnClass = 'col-number-standard';
                  } else if (col.label && col.label.includes('번호')) {
                    columnClass = 'col-phone-standard';
                  } else {
                    columnClass = 'col-text-standard';
                  }

                  // 마지막 컬럼은 col-expand 추가
                  if (isLastColumn) {
                    columnClass += ' col-expand';
                  }

                  return (
                    <th
                      key={col.name}
                      className={columnClass}
                      onClick={() => handleSort(col.name)}
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
                        {col.label || col.name}
                        {sortColumn === col.name && (
                          <span style={{ fontSize: '12px' }}>
                            {sortOrder === 'asc' ? '▲' : '▼'}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((row, index) => (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row)}
                  onContextMenu={(e) => handleContextMenu(e, row)}
                  style={{
                    backgroundColor: selectedRowId === row.id ? '#e3f2fd' : (index % 2 === 0 ? '#ffffff' : '#f5f5f5'),
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedRowId !== row.id) {
                      e.currentTarget.style.backgroundColor = '#dcfce7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedRowId !== row.id) {
                      e.currentTarget.style.backgroundColor = (index % 2 === 0 ? '#ffffff' : '#f5f5f5');
                    }
                  }}
                >
                  {displayColumns.map((col, colIndex) => {
                    const isLastColumn = colIndex === displayColumns.length - 1;
                    let columnClass = '';

                    // 컬럼 타입별 클래스 지정
                    if (col.type === 'date') {
                      columnClass = 'col-date-standard';
                    } else if (col.type === 'number') {
                      columnClass = 'col-number-standard';
                    } else if (col.label && col.label.includes('번호')) {
                      columnClass = 'col-phone-standard';
                    } else {
                      columnClass = 'col-text-standard';
                    }

                    // 마지막 컬럼은 col-expand 추가
                    if (isLastColumn) {
                      columnClass += ' col-expand';
                    }

                    return (
                      <td key={`${row.id}-${colIndex}`} className={columnClass} style={{ padding: '12px' }}>
                        {renderCellValue(row[col.name], col.type)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            {searchTerm ? '검색 결과가 없습니다' : `등록된 ${tableMetadata.name}이 없습니다`}
          </div>
        )}
      </div>

      {/* 컨텍스트 메뉴 */}
      {contextMenu && (
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
            onClick={() => setContextMenu(null)}
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
              onClick={() => {
                onEdit(contextMenu.row);
                setContextMenu(null);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#333'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              수정
            </button>
            <button
              onClick={() => {
                onDelete(contextMenu.row);
                setContextMenu(null);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#d32f2f'
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

export default DynamicTableView;
