import React, { useState } from 'react';

const BookmarkBar = ({
  bookmarks = [],
  onOpenModal = () => {},
  onEditBookmark = () => {},
  onDeleteBookmark = () => {}
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedBookmark, setSelectedBookmark] = useState(null);

  // 섹션별로 북마크 분류
  const sections = [1, 2, 3, 4];
  const getBookmarksBySection = (sectionNum) => {
    return bookmarks.filter(b => (b.section || 1) === sectionNum);
  };

  // 북마크 좌클릭: 새 탭에서 URL 열기
  const handleBookmarkClick = (bookmark) => {
    if (bookmark.url) {
      window.open(bookmark.url, '_blank');
    }
  };

  // 북마크 우클릭: 컨텍스트 메뉴
  const handleBookmarkRightClick = (e, bookmark) => {
    e.preventDefault();
    setSelectedBookmark(bookmark);
    setContextMenu({
      x: e.clientX,
      y: e.clientY
    });
  };

  // 컨텍스트 메뉴 - 변경
  const handleEditBookmark = () => {
    if (selectedBookmark) {
      onEditBookmark(selectedBookmark);
    }
    setContextMenu(null);
  };

  // 컨텍스트 메뉴 - 바로 복사
  const handleCopyURL = () => {
    if (selectedBookmark && selectedBookmark.url) {
      navigator.clipboard.writeText(selectedBookmark.url);
      alert('URL이 복사되었습니다');
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
              borderRight: sectionNum < 4 ? '1px solid #ccc' : 'none',
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
              flexShrink: 0
            }}>
              <span>영역 {sectionNum}</span>
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
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
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
                  onContextMenu={(e) => handleBookmarkRightClick(e, bookmark)}
                  title={bookmark.url}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: bookmark.color || '#87CEEB',
                    color: '#000',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    flexShrink: 0,
                    height: 'fit-content'
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
              onClick={handleEditBookmark}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#333'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              변경
            </button>
            <button
              onClick={handleCopyURL}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#333'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              바로 복사
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
                fontSize: '13px',
                color: '#d32f2f'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#ffebee'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              삭제
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
