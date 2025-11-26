import React, { useState, useMemo } from 'react';
import { JOURNAL_CATEGORIES } from '../../constants';

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
  const [isExpandedMemo, setIsExpandedMemo] = useState(false); // 메모 확장 상태
  const [checklistItems, setChecklistItems] = useState([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tempCategory, setTempCategory] = useState(''); // 임시 선택 카테고리
  const [expandedChecklistItem, setExpandedChecklistItem] = useState(null); // 열린 체크리스트 항목
  const [checklistReplyText, setChecklistReplyText] = useState(''); // 답글 입력 필드
  const [editingChecklistItemId, setEditingChecklistItemId] = useState(null); // 편집 중인 체크리스트 항목 ID
  const [editingChecklistText, setEditingChecklistText] = useState(''); // 편집 중인 체크리스트 텍스트
  const [editingReplyId, setEditingReplyId] = useState(null); // 편집 중인 답글 ID (itemId:replyId 형식)
  const [editingReplyText, setEditingReplyText] = useState(''); // 편집 중인 답글 텍스트

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
          // YYYY-MM-DD HH:MM 형식 감지 (기록일시 형식) - 타임스탐프 기반 정렬
          const dateTimeRegex = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/;
          const aIsDateTime = dateTimeRegex.test(aVal);
          const bIsDateTime = dateTimeRegex.test(bVal);

          if (aIsDateTime && bIsDateTime) {
            // 타임스탐프 기반 비교 (ISO 형식으로 변환)
            const aDate = new Date(aVal.replace(' ', 'T'));
            const bDate = new Date(bVal.replace(' ', 'T'));
            comparison = aDate.getTime() - bDate.getTime();
          } else {
            // 문자열 기반 비교
            comparison = String(aVal).localeCompare(String(bVal), 'ko-KR');
          }
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

    // YYYY-MM-DD HH:MM 형식 감지 (기록일시 형식)
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/;
    if (dateTimeRegex.test(value)) {
      return value.split(' ')[0]; // YYYY-MM-DD만 추출
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

  // selectedRow가 변경될 때 editingValues, memoValue, checklistItems 초기화
  React.useEffect(() => {
    if (selectedRow) {
      setEditingValues({ ...selectedRow });
      setMemoValue(selectedRow.memo || '');
      setChecklistItems(selectedRow.checklists || []);
      setSelectedCategory(selectedRow.category || '');
      setIsEditing(false);
      setIsEditingMemo(false);
      setIsAddingChecklist(false);
      setNewChecklistText('');
      setIsExpandedMemo(false); // 메모 확장 상태 초기화
      setEditingReplyId(null); // 답글 편집 상태 초기화
      setEditingReplyText('');
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

  // 행이 선택될 때 tempCategory, expandedChecklistItem, 편집 상태 초기화
  React.useEffect(() => {
    if (selectedRow) {
      setTempCategory(selectedRow.category || '');
      setExpandedChecklistItem(null);
      setChecklistReplyText('');
      setEditingChecklistItemId(null);
      setEditingChecklistText('');
    }
  }, [selectedRow?.id]);

  // 임시 카테고리 선택 (저장 전)
  const handleTempCategoryChange = (newCategory) => {
    setTempCategory(newCategory);
  };

  // 카테고리 저장 (확정)
  const handleSaveCategoryChange = () => {
    setSelectedCategory(tempCategory);
    if (selectedRow) {
      onEdit({ ...selectedRow, category: tempCategory });
    }
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

  // 체크리스트 항목 추가
  const handleAddChecklistItem = () => {
    if (newChecklistText.trim()) {
      const now = new Date();
      const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newItem = {
        id: `checklist_${Date.now()}_${Math.random()}`,
        text: newChecklistText.trim(),
        completed: false,
        createdAt
      };

      const updatedChecklists = [...checklistItems, newItem];
      setChecklistItems(updatedChecklists);
      setNewChecklistText('');

      if (selectedRow) {
        onEdit({ ...selectedRow, checklists: updatedChecklists });
      }
    }
  };

  // 체크리스트 항목 완료 토글
  const handleToggleChecklistItem = (id) => {
    const updatedChecklists = checklistItems.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklistItems(updatedChecklists);

    if (selectedRow) {
      onEdit({ ...selectedRow, checklists: updatedChecklists });
    }
  };

  // 체크리스트 항목 삭제
  const handleDeleteChecklistItem = (id) => {
    const updatedChecklists = checklistItems.filter(item => item.id !== id);
    setChecklistItems(updatedChecklists);

    if (selectedRow) {
      onEdit({ ...selectedRow, checklists: updatedChecklists });
    }
  };

  // 체크리스트 답글 추가
  const handleAddChecklistReply = (itemId) => {
    if (!checklistReplyText.trim()) return;

    const updatedChecklists = checklistItems.map(item => {
      if (item.id === itemId) {
        const replies = item.replies || [];
        return {
          ...item,
          replies: [
            ...replies,
            {
              id: `reply_${Date.now()}_${Math.random()}`,
              text: checklistReplyText.trim(),
              createdAt: new Date().toISOString()
            }
          ]
        };
      }
      return item;
    });

    setChecklistItems(updatedChecklists);
    setChecklistReplyText('');

    if (selectedRow) {
      onEdit({ ...selectedRow, checklists: updatedChecklists });
    }
  };

  // 체크리스트 답글 삭제
  const handleDeleteChecklistReply = (itemId, replyId) => {
    const updatedChecklists = checklistItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          replies: (item.replies || []).filter(reply => reply.id !== replyId)
        };
      }
      return item;
    });

    setChecklistItems(updatedChecklists);

    if (selectedRow) {
      onEdit({ ...selectedRow, checklists: updatedChecklists });
    }
  };

  // 체크리스트 인라인 편집 시작
  const handleStartEditChecklist = (itemId, itemText) => {
    setEditingChecklistItemId(itemId);
    setEditingChecklistText(itemText);
  };

  // 체크리스트 인라인 편집 저장
  const handleSaveChecklistEdit = (itemId) => {
    if (!editingChecklistText.trim()) return;

    const updatedChecklists = checklistItems.map(item => {
      if (item.id === itemId) {
        return { ...item, text: editingChecklistText.trim() };
      }
      return item;
    });

    setChecklistItems(updatedChecklists);
    setEditingChecklistItemId(null);
    setEditingChecklistText('');

    if (selectedRow) {
      onEdit({ ...selectedRow, checklists: updatedChecklists });
    }
  };

  // 체크리스트 인라인 편집 취소
  const handleCancelChecklistEdit = () => {
    setEditingChecklistItemId(null);
    setEditingChecklistText('');
  };

  // 답글 인라인 편집 시작
  const handleStartEditReply = (itemId, replyId, replyText) => {
    setEditingReplyId(`${itemId}:${replyId}`);
    setEditingReplyText(replyText);
  };

  // 답글 인라인 편집 저장
  const handleSaveReply = (itemId, replyId) => {
    if (!editingReplyText.trim()) return;

    const updatedChecklists = checklistItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          replies: (item.replies || []).map(reply => {
            if (reply.id === replyId) {
              return { ...reply, text: editingReplyText.trim() };
            }
            return reply;
          })
        };
      }
      return item;
    });

    setChecklistItems(updatedChecklists);
    setEditingReplyId(null);
    setEditingReplyText('');

    if (selectedRow) {
      onEdit({ ...selectedRow, checklists: updatedChecklists });
    }
  };

  // 답글 인라인 편집 취소
  const handleCancelEditReply = () => {
    setEditingReplyId(null);
    setEditingReplyText('');
  };

  // 체크리스트 완료율 계산
  const getChecklistProgress = () => {
    if (checklistItems.length === 0) return 0;
    const completed = checklistItems.filter(item => item.completed).length;
    return Math.round((completed / checklistItems.length) * 100);
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

          {/* 카테고리 버튼 */}
          <div style={{
            padding: '15px 20px',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}>
            {/* 카테고리 버튼들 */}
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap',
              flex: 1
            }}>
              {JOURNAL_CATEGORIES.map((cat, index) => {
                // 각 버튼에 고유 색상 부여
                const colors = ['#4CAF50', '#2196F3', '#f44336', '#FFC107']; // 녹색, 파란색, 빨간색, 노란색
                const color = colors[index];
                const isDark = index === 3; // 노란색은 텍스트를 어둡게

                return (
                  <button
                    key={cat}
                    onClick={() => handleTempCategoryChange(cat)}
                    style={{
                      padding: '8px 16px',
                      border: tempCategory === cat ? `2px solid ${color}` : '1px solid #ddd',
                      borderRadius: '20px',
                      fontSize: '13px',
                      backgroundColor: tempCategory === cat ? color : '#fff',
                      color: tempCategory === cat ? '#fff' : isDark ? '#333' : color,
                      cursor: 'pointer',
                      fontWeight: tempCategory === cat ? '600' : '400',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      if (tempCategory !== cat) {
                        e.target.style.borderColor = color;
                        e.target.style.color = color;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (tempCategory !== cat) {
                        e.target.style.borderColor = '#ddd';
                        e.target.style.color = isDark ? '#333' : color;
                      }
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* 저장 버튼 */}
            <button
              onClick={handleSaveCategoryChange}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1976D2';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#2196F3';
              }}
            >
              저장
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
                borderBottom: '2px solid #2196F3',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                userSelect: 'none',
                transition: 'color 0.2s'
              }}
              onClick={() => selectedRow.memo && selectedRow.memo.split('\n').length > 3 && setIsExpandedMemo(!isExpandedMemo)}
              onMouseEnter={(e) => {
                if (selectedRow.memo && selectedRow.memo.split('\n').length > 3) {
                  e.currentTarget.style.color = '#1976d2';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#666';
              }}
              >
                {selectedRow.memo && selectedRow.memo.split('\n').length > 3 && (
                  <span style={{ fontSize: '12px' }}>{isExpandedMemo ? '▼' : '▶'}</span>
                )}
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
                  {selectedRow.memo ? (
                    <>
                      {isExpandedMemo ? (
                        selectedRow.memo
                      ) : (
                        selectedRow.memo.split('\n').slice(0, 3).join('\n') +
                        (selectedRow.memo.split('\n').length > 3 ? '\n...' : '')
                      )}
                    </>
                  ) : (
                    '메모가 없습니다 (더블클릭하여 편집)'
                  )}
                </div>
              )}
            </section>

            {/* 체크리스트 섹션 */}
            <section>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <h4 style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#666',
                  margin: 0,
                  paddingBottom: '8px',
                  borderBottom: '2px solid #9C27B0',
                  flex: 1
                }}>
                  ✅ 체크리스트
                </h4>
                {checklistItems.length > 0 && (
                  <span style={{
                    fontSize: '12px',
                    color: '#999',
                    marginLeft: '10px',
                    whiteSpace: 'nowrap'
                  }}>
                    {checklistItems.filter(item => item.completed).length}/{checklistItems.length}
                  </span>
                )}
              </div>

              {/* 체크리스트 항목 목록 */}
              {checklistItems.length > 0 && (
                <div style={{
                  marginBottom: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '13px'
                }}>
                  {checklistItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '10px',
                        backgroundColor: '#fafafa',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                    >
                      {/* 체크리스트 항목 */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleChecklistItem(item.id)}
                          style={{
                            marginTop: '3px',
                            cursor: 'pointer',
                            accentColor: '#9C27B0'
                          }}
                        />
                        {editingChecklistItemId === item.id ? (
                          <input
                            autoFocus
                            type="text"
                            value={editingChecklistText}
                            onChange={(e) => setEditingChecklistText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveChecklistEdit(item.id);
                              } else if (e.key === 'Escape') {
                                handleCancelChecklistEdit();
                              }
                            }}
                            onBlur={() => handleSaveChecklistEdit(item.id)}
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              border: '2px solid #9C27B0',
                              borderRadius: '3px',
                              fontSize: '13px',
                              fontFamily: 'inherit',
                              boxSizing: 'border-box'
                            }}
                          />
                        ) : (
                          <span
                            onDoubleClick={() => handleStartEditChecklist(item.id, item.text)}
                            style={{
                              flex: 1,
                              color: item.completed ? '#999' : '#333',
                              textDecoration: item.completed ? 'line-through' : 'none',
                              wordBreak: 'break-word',
                              fontSize: '13px',
                              cursor: 'text',
                              userSelect: 'none'
                            }}
                          >
                            {item.text}
                          </span>
                        )}
                        <button
                          onClick={() => setExpandedChecklistItem(expandedChecklistItem === item.id ? null : item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#2196F3',
                            cursor: 'pointer',
                            padding: '0 5px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                          title="답글"
                        >
                          💬 {(item.replies || []).length}
                        </button>
                        <button
                          onClick={() => handleDeleteChecklistItem(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#d32f2f',
                            cursor: 'pointer',
                            padding: '0 5px',
                            fontSize: '14px',
                            minWidth: '24px',
                            padding: '2px 6px'
                          }}
                          title="삭제"
                        >
                          ✕
                        </button>
                      </div>

                      {/* 답글 섹션 (펼쳐진 경우만 표시) */}
                      {expandedChecklistItem === item.id && (
                        <div style={{
                          marginLeft: '28px',
                          paddingTop: '8px',
                          borderTop: '1px solid #e0e0e0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          {/* 기존 답글들 */}
                          {(item.replies || []).length > 0 && (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              marginBottom: '8px'
                            }}>
                              {item.replies.map(reply => {
                                const isEditingThisReply = editingReplyId === `${item.id}:${reply.id}`;
                                return (
                                  <div
                                    key={reply.id}
                                    style={{
                                      padding: '8px 10px',
                                      backgroundColor: isEditingThisReply ? '#fff' : '#f0f0f0',
                                      borderRadius: '3px',
                                      fontSize: '12px',
                                      display: 'flex',
                                      gap: '8px',
                                      alignItems: 'flex-start',
                                      border: isEditingThisReply ? '1px solid #2196F3' : 'none'
                                    }}
                                  >
                                    {isEditingThisReply ? (
                                      <textarea
                                        value={editingReplyText}
                                        onChange={(e) => setEditingReplyText(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSaveReply(item.id, reply.id);
                                          } else if (e.key === 'Escape') {
                                            handleCancelEditReply();
                                          }
                                        }}
                                        onBlur={() => handleSaveReply(item.id, reply.id)}
                                        autoFocus
                                        style={{
                                          flex: 1,
                                          minHeight: '60px',
                                          padding: '6px 8px',
                                          border: '1px solid #ddd',
                                          borderRadius: '3px',
                                          fontSize: '12px',
                                          fontFamily: 'inherit',
                                          resize: 'vertical',
                                          boxSizing: 'border-box'
                                        }}
                                      />
                                    ) : (
                                      <span
                                        onDoubleClick={() => handleStartEditReply(item.id, reply.id, reply.text)}
                                        style={{
                                          flex: 1,
                                          color: '#333',
                                          whiteSpace: 'pre-wrap',
                                          wordBreak: 'break-word',
                                          lineHeight: '1.4',
                                          cursor: 'pointer',
                                          userSelect: 'none'
                                        }}
                                      >
                                        {reply.text}
                                      </span>
                                    )}
                                    {!isEditingThisReply && (
                                      <button
                                        onClick={() => handleDeleteChecklistReply(item.id, reply.id)}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          color: '#d32f2f',
                                          cursor: 'pointer',
                                          padding: '0',
                                          fontSize: '12px',
                                          minWidth: '16px',
                                          flexShrink: 0
                                        }}
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* 답글 입력 필드 */}
                          <div style={{
                            display: 'flex',
                            gap: '6px',
                            flexDirection: 'column'
                          }}>
                            <textarea
                              value={expandedChecklistItem === item.id ? checklistReplyText : ''}
                              onChange={(e) => setChecklistReplyText(e.target.value)}
                              placeholder="답글 입력 (Shift+Enter: 줄바꿈)"
                              style={{
                                flex: 1,
                                minHeight: '60px',
                                padding: '8px 10px',
                                border: '1px solid #ddd',
                                borderRadius: '3px',
                                fontSize: '12px',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                boxSizing: 'border-box'
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddChecklistReply(item.id);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleAddChecklistReply(item.id)}
                              disabled={!checklistReplyText.trim()}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: checklistReplyText.trim() ? '#2196F3' : '#ddd',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: checklistReplyText.trim() ? 'pointer' : 'not-allowed',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              답글 추가
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 신규 항목 입력 */}
              <div style={{
                display: 'flex',
                gap: '8px',
                fontSize: '13px'
              }}>
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddChecklistItem();
                    }
                  }}
                  placeholder="새 항목 입력 (Enter로 추가)"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  onClick={handleAddChecklistItem}
                  disabled={!newChecklistText.trim()}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: newChecklistText.trim() ? '#9C27B0' : '#ddd',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: newChecklistText.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  +
                </button>
              </div>
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
          <table className="customer-table" style={{ width: '100%', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                {displayColumns.map((col, colIndex) => {
                  const isLastColumn = colIndex === displayColumns.length - 1;
                  let columnClass = '';
                  let columnStyle = {
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '12px',
                    whiteSpace: 'nowrap',
                    textAlign: 'left',
                    fontWeight: '600'
                  };

                  // 일지 테이블: 첫 번째 컬럼(기록일) 너비 150px, 두 번째 컬럼(제목) 나머지
                  const isJournalTable = tableMetadata.name?.includes('일지') || tableMetadata.name?.includes('journal');
                  // 오늘 기록 테이블: 첫 번째 컬럼(기록일자) 너비 180px
                  const isTodayLogTable = tableMetadata.name === '오늘 기록';

                  if (isJournalTable) {
                    // 첫 번째 컬럼(기록일) 너비 150px로 고정
                    if (colIndex === 0) {
                      columnStyle.width = '150px';
                      columnStyle.minWidth = '150px';
                      columnStyle.maxWidth = '150px';
                    }
                    // 두 번째 컬럼(제목) - 나머지 공간 차지
                    if (colIndex === 1) {
                      columnStyle.whiteSpace = 'normal';
                      columnStyle.flex = 1;
                    }
                  } else if (isTodayLogTable) {
                    // 오늘 기록 테이블: 첫 번째 컬럼(기록일자) 너비 180px로 고정
                    if (colIndex === 0) {
                      columnStyle.width = '180px';
                      columnStyle.minWidth = '180px';
                      columnStyle.maxWidth = '180px';
                    }
                    // 두 번째 컬럼(내용) - 나머지 공간 차지
                    if (colIndex === 1) {
                      columnStyle.whiteSpace = 'normal';
                      columnStyle.flex = 1;
                    }
                  } else {
                    // 다른 테이블: 첫 번째 컬럼(기록일시) 너비 200px로 고정
                    if (colIndex === 0) {
                      columnStyle.width = '200px';
                      columnStyle.minWidth = '200px';
                      columnStyle.maxWidth = '200px';
                    }

                    // 두 번째 컬럼(제목) 너비 250px로 고정
                    if (colIndex === 1) {
                      columnStyle.width = '250px';
                      columnStyle.minWidth = '250px';
                      columnStyle.maxWidth = '250px';
                      columnStyle.whiteSpace = 'normal';
                    }
                  }

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

                  // 첫 번째 컬럼은 모바일에서 숨김
                  if (colIndex === 0) {
                    columnClass += ' col-hidden-mobile';
                  }

                  return (
                    <th
                      key={col.name}
                      className={columnClass}
                      onClick={() => handleSort(col.name)}
                      style={columnStyle}
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
                    let columnStyle = {
                      padding: '12px'
                    };

                    // 일지 테이블: 첫 번째 컬럼(기록일) 너비 150px, 두 번째 컬럼(제목) 나머지
                    const isJournalTable = tableMetadata.name?.includes('일지') || tableMetadata.name?.includes('journal');
                    // 오늘 기록 테이블: 첫 번째 컬럼(기록일자) 너비 180px
                    const isTodayLogTable = tableMetadata.name === '오늘 기록';

                    if (isJournalTable) {
                      // 첫 번째 컬럼(기록일) 너비 150px로 고정
                      if (colIndex === 0) {
                        columnStyle.width = '150px';
                        columnStyle.minWidth = '150px';
                        columnStyle.maxWidth = '150px';
                      }
                      // 두 번째 컬럼(제목) - 나머지 공간 차지
                      if (colIndex === 1) {
                        columnStyle.whiteSpace = 'normal';
                        columnStyle.wordBreak = 'break-word';
                        columnStyle.flex = 1;
                      }
                    } else if (isTodayLogTable) {
                      // 오늘 기록 테이블: 첫 번째 컬럼(기록일자) 너비 180px로 고정
                      if (colIndex === 0) {
                        columnStyle.width = '180px';
                        columnStyle.minWidth = '180px';
                        columnStyle.maxWidth = '180px';
                      }
                      // 두 번째 컬럼(내용) - 나머지 공간 차지
                      if (colIndex === 1) {
                        columnStyle.whiteSpace = 'normal';
                        columnStyle.wordBreak = 'break-word';
                        columnStyle.flex = 1;
                      }
                    } else {
                      // 다른 테이블: 첫 번째 컬럼(기록일시) 너비 200px로 고정
                      if (colIndex === 0) {
                        columnStyle.width = '200px';
                        columnStyle.minWidth = '200px';
                        columnStyle.maxWidth = '200px';
                      }

                      // 두 번째 컬럼(제목) 너비 250px로 고정
                      if (colIndex === 1) {
                        columnStyle.width = '250px';
                        columnStyle.minWidth = '250px';
                        columnStyle.maxWidth = '250px';
                        columnStyle.whiteSpace = 'normal';
                        columnStyle.wordBreak = 'break-word';
                      }
                    }

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

                    // 첫 번째 컬럼은 모바일에서 숨김
                    if (colIndex === 0) {
                      columnClass += ' col-hidden-mobile';
                    }

                    return (
                      <td key={`${row.id}-${colIndex}`} className={columnClass} style={columnStyle}>
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
