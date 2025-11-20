import React, { useState, useEffect } from 'react';

const BookmarkBar = ({
  bookmarks = [],
  onOpenModal = () => {},
  onEditBookmark = () => {},
  onDeleteBookmark = () => {},
  onSaveBookmark = () => {}
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const [clipboardBookmark, setClipboardBookmark] = useState(null);
  const [sectionNames, setSectionNames] = useState({
    1: '영역 1',
    2: '영역 2',
    3: '영역 3',
    4: '영역 4'
  });
  const [editingSectionNum, setEditingSectionNum] = useState(null);
  const [editingSectionName, setEditingSectionName] = useState('');

  // localStorage에서 섹션 이름 로드
  useEffect(() => {
    const savedNames = localStorage.getItem('bookmarkSectionNames');
    if (savedNames) {
      try {
        setSectionNames(JSON.parse(savedNames));
      } catch (e) {
        console.error('Failed to load section names:', e);
      }
    }
  }, []);

  // 섹션 이름 저장
  const saveSectionNames = (newNames) => {
    setSectionNames(newNames);
    localStorage.setItem('bookmarkSectionNames', JSON.stringify(newNames));
  };

  // 섹션 이름 수정 시작
  const handleStartEditSectionName = (sectionNum) => {
    setEditingSectionNum(sectionNum);
    setEditingSectionName(sectionNames[sectionNum]);
  };

  // 섹션 이름 수정 저장
  const handleSaveSectionName = (sectionNum) => {
    if (editingSectionName.trim()) {
      const newNames = { ...sectionNames, [sectionNum]: editingSectionName.trim() };
      saveSectionNames(newNames);
    }
    setEditingSectionNum(null);
    setEditingSectionName('');
  };

  // 섹션 이름 수정 취소
  const handleCancelEditSectionName = () => {
    setEditingSectionNum(null);
    setEditingSectionName('');
  };

  // 섹션별로 북마크 분류
  const sections = [1, 2, 3, 4];
  const getBookmarksBySection = (sectionNum) => {
    return bookmarks.filter(b => (b.section || 1) === sectionNum);
  };

  // 섹션별 배경색
  const getSectionColor = (sectionNum) => {
    const colors = {
      1: '#E1F5FE', // Light Blue
      2: '#F1F8E9', // Light Green
      3: '#FFFEF0', // Light Amber
      4: '#FCE4EC'  // Light Pink
    };
    return colors[sectionNum] || '#ffffff';
  };

  // 북마크 좌클릭: 새 탭에서 URL 열기
  const handleBookmarkClick = (bookmark) => {
    if (bookmark.url) {
      window.open(bookmark.url, '_blank');
    }
  };

  // 북마크 우클릭: 컨텍스트 메뉴
  const handleBookmarkRightClick = (e, bookmark, sectionNum) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBookmark(bookmark);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      targetSection: sectionNum
    });
  };

  // 컨텍스트 메뉴 - 변경
  const handleEditBookmark = () => {
    if (selectedBookmark) {
      onEditBookmark(selectedBookmark);
    }
    setContextMenu(null);
  };

  // 컨텍스트 메뉴 - URL 복사
  const handleCopyURL = () => {
    if (selectedBookmark && selectedBookmark.url) {
      navigator.clipboard.writeText(selectedBookmark.url);
      alert('URL이 복사되었습니다');
    }
    setContextMenu(null);
  };

  // 컨텍스트 메뉴 - 북마크 복사
  const handleCopyBookmark = () => {
    if (selectedBookmark) {
      setClipboardBookmark({ ...selectedBookmark });
      alert(`"${selectedBookmark.name}" 북마크가 복사되었습니다`);
    }
    setContextMenu(null);
  };

  // 컨텍스트 메뉴 - 북마크 붙여넣기
  const handlePasteBookmark = (targetSection) => {
    if (clipboardBookmark) {
      const newBookmark = {
        ...clipboardBookmark,
        id: `bookmark_${Date.now()}`,
        section: targetSection,
        createdAt: new Date().toISOString()
      };
      onSaveBookmark(newBookmark);
      alert(`"${clipboardBookmark.name}" 북마크가 영역 ${targetSection}에 붙여넣어졌습니다`);
    } else {
      alert('복사된 북마크가 없습니다');
    }
    setContextMenu(null);
  };

  // 컨텍스트 메뉴 - 삭제
  const handleDelete = () => {
    if (selectedBookmark) {
      if (confirm(`"${selectedBookmark.name}" 북마크를 삭제하시겠습니까?`)) {
        onDeleteBookmark(selectedBookmark.id);
      }
    }
    setContextMenu(null);
  };

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: '0',
        padding: '0',
        backgroundColor: '#E8D5F2',
        height: '120px',
        overflowX: 'hidden',
        overflowY: 'hidden',
        flexShrink: 0,
        borderBottom: '1px solid #ddd'
      }}>
        {/* 4개 섹션 */}
        {sections.map((sectionNum) => (
          <div
            key={sectionNum}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '8px',
              backgroundColor: getSectionColor(sectionNum),
              borderRight: sectionNum < 4 ? '2px solid #000' : 'none',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            {/* 섹션 헤더 + 추가 버튼 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              color: '#666',
              fontWeight: '600',
              height: '20px',
              flexShrink: 0,
              gap: '4px'
            }}>
              {editingSectionNum === sectionNum ? (
                <input
                  autoFocus
                  type="text"
                  value={editingSectionName}
                  onChange={(e) => setEditingSectionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveSectionName(sectionNum);
                    } else if (e.key === 'Escape') {
                      handleCancelEditSectionName();
                    }
                  }}
                  onBlur={() => handleSaveSectionName(sectionNum)}
                  style={{
                    flex: 1,
                    padding: '2px 4px',
                    fontSize: '11px',
                    border: '1px solid #999',
                    borderRadius: '2px',
                    fontWeight: '600'
                  }}
                />
              ) : (
                <span
                  onDoubleClick={() => handleStartEditSectionName(sectionNum)}
                  style={{
                    cursor: 'pointer',
                    userSelect: 'none',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title="더블클릭하여 편집"
                >
                  {sectionNames[sectionNum]}
                </span>
              )}
              <button
                onClick={() => onOpenModal(sectionNum)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '1px solid #999',
                  backgroundColor: 'transparent',
                  color: '#999',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  padding: '0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#666';
                  e.currentTarget.style.color = '#666';
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#999';
                  e.currentTarget.style.color = '#999';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                +
              </button>
            </div>

            {/* 북마크 버튼들 컨테이너 (2줄 지원) */}
            <div
              onContextMenu={(e) => {
                e.preventDefault();
                setSelectedBookmark(null);
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  targetSection: sectionNum
                });
              }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px',
                alignContent: 'flex-start',
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden'
              }}
            >
              {getBookmarksBySection(sectionNum).map((bookmark) => (
                <button
                  key={bookmark.id}
                  onClick={() => handleBookmarkClick(bookmark)}
                  onContextMenu={(e) => handleBookmarkRightClick(e, bookmark, sectionNum)}
                  title={bookmark.url}
                  style={{
                    padding: '6px 8px',
                    backgroundColor: bookmark.color || '#87CEEB',
                    color: '#000',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    flex: 1,
                    minWidth: 0,
                    height: '28px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  {bookmark.name}
                </button>
              ))}
            </div>
          </div>
        ))}
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
            onClick={(e) => e.stopPropagation()}
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
            {/* 변경 */}
            <button
              onClick={handleEditBookmark}
              disabled={!selectedBookmark}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: selectedBookmark ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                color: selectedBookmark ? '#333' : '#ccc'
              }}
              onMouseEnter={(e) => {
                if (selectedBookmark) e.target.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              변경
            </button>

            {/* URL 복사 */}
            <button
              onClick={handleCopyURL}
              disabled={!selectedBookmark}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: selectedBookmark ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                color: selectedBookmark ? '#333' : '#ccc'
              }}
              onMouseEnter={(e) => {
                if (selectedBookmark) e.target.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              URL 복사
            </button>

            {/* 북마크 복사 */}
            <button
              onClick={handleCopyBookmark}
              disabled={!selectedBookmark}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: selectedBookmark ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                color: selectedBookmark ? '#333' : '#ccc'
              }}
              onMouseEnter={(e) => {
                if (selectedBookmark) e.target.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              북마크 복사
            </button>

            {/* 삭제 */}
            <button
              onClick={handleDelete}
              disabled={!selectedBookmark}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: selectedBookmark ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                color: selectedBookmark ? '#d32f2f' : '#ccc'
              }}
              onMouseEnter={(e) => {
                if (selectedBookmark) e.target.style.backgroundColor = '#ffebee';
              }}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              삭제
            </button>

            {/* 붙여넣기 */}
            <button
              onClick={() => handlePasteBookmark(contextMenu.targetSection)}
              disabled={!clipboardBookmark}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: clipboardBookmark ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                color: clipboardBookmark ? '#2196F3' : '#ccc'
              }}
              onMouseEnter={(e) => {
                if (clipboardBookmark) e.target.style.backgroundColor = '#e3f2fd';
              }}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              북마크 붙여넣기
            </button>

            <div style={{ height: '1px', backgroundColor: '#eee' }} />
            <button
              onClick={() => setContextMenu(null)}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#999'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              취소
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default BookmarkBar;
