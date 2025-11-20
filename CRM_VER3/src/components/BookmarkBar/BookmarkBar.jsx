import React, { useState } from 'react';

const BookmarkBar = ({
  bookmarks = [],
  onOpenModal = () => {},
  onEditBookmark = () => {},
  onDeleteBookmark = () => {}
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedBookmark, setSelectedBookmark] = useState(null);

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
        alignItems: 'center',
        gap: '8px',
        padding: '8px 20px',
        backgroundColor: '#E8D5F2',
        height: '60px',
        overflowX: 'auto',
        overflowY: 'hidden',
        flexShrink: 0,
        borderBottom: '1px solid #ddd'
      }}>
        {/* 북마크 버튼들 */}
        {bookmarks.map((bookmark) => (
          <button
            key={bookmark.id}
            onClick={() => handleBookmarkClick(bookmark)}
            onContextMenu={(e) => handleBookmarkRightClick(e, bookmark)}
            title={bookmark.url}
            style={{
              padding: '6px 12px',
              backgroundColor: bookmark.color || '#87CEEB',
              color: '#000',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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

        {/* 우측 스페이서 */}
        <div style={{ flex: 1 }} />

        {/* + 버튼 */}
        <button
          onClick={onOpenModal}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '2px solid #999',
            backgroundColor: 'transparent',
            color: '#999',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0
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
