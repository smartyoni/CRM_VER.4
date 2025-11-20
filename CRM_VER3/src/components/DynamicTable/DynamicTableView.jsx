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
  const [isEditing, setIsEditing] = useState(false);
  const [editingValues, setEditingValues] = useState({});
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoValue, setMemoValue] = useState('');

  if (!tableMetadata) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        테이블 정보를 로드할 수 없습니다.
      </div>
    );
  }

  const columns = tableMetadata.columns || [];
  const displayColumns = columns.filter(col => col.display !== false);

  // tableMetadata가 로드될 때 기록일시 컬럼으로 기본 정렬 설정
  React.useEffect(() => {
    if (tableMetadata && tableMetadata.columns) {
      const memoColumn = tableMetadata.columns.find(col => {
        const colName = col.name.toLowerCase();
        const colLabel = (col.label || '').toLowerCase();
        // "기록일시", "일시", "로그" 등 시간 관련 컬럼 감지
        return (colName.includes('기록') && colName.includes('일시')) ||
               (colLabel.includes('기록') && colLabel.includes('일시')) ||
               colName === 'recordedat' || colName === 'recorded_at' ||
               colName === 'loggedat' || colName === 'logged_at';
      });

      if (memoColumn) {
        setSortColumn(memoColumn.name);
        setSortOrder('desc');
      }
    }
  }, [tableMetadata?.id]);

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

  // 선택된 행 찾기
  const selectedRow = tableData.find(row => row.id === selectedRowId);

  // selectedRow가 변경될 때 editingValues와 memoValue 초기화
  React.useEffect(() => {
    if (selectedRow) {
      setEditingValues({ ...selectedRow });
      setMemoValue(selectedRow.memo || '');
      setIsEditing(false);
      setIsEditingMemo(false);
    }
  }, [selectedRow?.id]);

  // 수정 모드 진입
  const handleStartEditing = () => {
    if (selectedRow) {
      setEditingValues({ ...selectedRow });
      setIsEditing(true);
    }
  };

  // 수정 값 변경
  const handleFieldChange = (fieldName, value) => {
    setEditingValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // 수정 저장
  const handleSaveEdit = () => {
    if (selectedRow) {
      onEdit(editingValues);
      setIsEditing(false);
    }
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditingValues({ ...selectedRow });
    setIsEditing(false);
  };

  // 메모 편집 모드 진입
  const handleEditMemo = () => {
    setMemoValue(selectedRow.memo || '');
    setIsEditingMemo(true);
  };

  // 메모 저장
  const handleSaveMemo = () => {
    if (selectedRow) {
      onEdit({ ...selectedRow, memo: memoValue });
      setIsEditingMemo(false);
    }
  };

  return (
    <>
      {/* 상세 패널 */}
      {selectedRow && (
        <aside className="detail-panel open" style={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh',
          width: '856px',
          borderLeft: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          overflow: 'hidden',
          zIndex: 50,
          boxShadow: '-2px 0 8px rgba(0,0,0,0.1)'
        }}>
          {/* 헤더 */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
              {tableMetadata.name} 상세
            </h3>
            <button
              onClick={() => onCloseDetailPanel()}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: 0,
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>

          {/* 콘텐츠 */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <section>
              <h4 style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#666',
                marginBottom: '10px',
                paddingBottom: '8px',
                borderBottom: '2px solid #2196F3'
              }}>
                📋 기본 정보
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                {displayColumns.map((col) => (
                  <div key={col.name} style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr',
                    gap: '10px',
                    alignItems: 'flex-start'
                  }}>
                    <span style={{ fontWeight: '600', color: '#666' }}>
                      {col.label || col.name}:
                    </span>
                    {isEditing ? (
                      <input
                        type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                        value={editingValues[col.name] || ''}
                        onChange={(e) => handleFieldChange(col.name, e.target.value)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontFamily: 'inherit'
                        }}
                      />
                    ) : (
                      <span style={{
                        color: '#333',
                        wordBreak: 'break-word'
                      }}>
                        {renderCellValue(selectedRow[col.name], col.type)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* 메모 섹션 */}
            <section>
              <h4 style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#666',
                marginBottom: '10px',
                paddingBottom: '8px',
                borderBottom: '2px solid #2196F3'
              }}>
                📝 메모
              </h4>
              {isEditingMemo ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    value={memoValue}
                    onChange={(e) => setMemoValue(e.target.value)}
                    rows="10"
                    placeholder="메모를 입력하세요"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      onClick={() => setIsEditingMemo(false)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '13px',
                        backgroundColor: '#999',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSaveMemo}
                      style={{
                        padding: '8px 16px',
                        fontSize: '13px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDoubleClick={handleEditMemo}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '4px',
                    minHeight: '140px',
                    color: selectedRow.memo ? '#333' : '#999',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: '1.5',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                >
                  {selectedRow.memo || '메모가 없습니다 (더블클릭하여 편집)'}
                </div>
              )}
            </section>
          </div>

          {/* 푸터 */}
          <div style={{
            padding: '15px',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
            backgroundColor: '#fff'
          }}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  저장
                </button>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    backgroundColor: '#999',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  취소
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleStartEditing}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  수정
                </button>
                <button
                  onClick={() => onDelete(selectedRow)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  삭제
                </button>
              </>
            )}
          </div>
        </aside>
      )}

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
    </>
  );
};

export default DynamicTableView;
