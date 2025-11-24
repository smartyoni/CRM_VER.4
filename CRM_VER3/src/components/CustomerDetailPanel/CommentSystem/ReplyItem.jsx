import React, { useState } from 'react';

const ReplyItem = ({ reply, parentAuthor, parentCommentId, onDeleteReply, onEditReply }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const formatDateTime = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day}. ${hours}:${minutes}`;
  };

  return (
    <div style={{
      marginLeft: '52px',
      marginTop: '12px',
      paddingLeft: '16px',
      borderLeft: '3px solid #2196F3'
    }}>
      {/* 들여쓰기 표시 */}
      <div style={{
        fontSize: '14px',
        color: '#ccc',
        marginLeft: '-12px',
        marginBottom: '4px'
      }}>
        └
      </div>

      <div style={{ flex: 1 }}>
        {/* 헤더: 멘션 + 날짜 + 메뉴 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <div>
            {reply.mentions && reply.mentions.length > 0 && (
              <>
                {reply.mentions.map((mention) => (
                  <span
                    key={mention}
                    style={{
                      backgroundColor: '#FFF9C4',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      marginRight: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#F57F17'
                    }}
                  >
                    @{mention}
                  </span>
                ))}
              </>
            )}
            <span style={{ fontSize: '12px', color: '#999' }}>
              {formatDateTime(reply.date || reply.createdAt)}
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                border: 'none',
                background: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px 8px',
                opacity: 0.6,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.6'}
            >
              ⋮
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 10,
                minWidth: '80px'
              }}>
                <button
                  onClick={() => {
                    onEditReply(reply);
                    setMenuOpen(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#333'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  수정
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('답글을 삭제하시겠습니까?')) {
                      onDeleteReply(reply.id);
                    }
                    setMenuOpen(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#f44336',
                    borderTop: '1px solid #f0f0f0'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#ffebee'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 대댓글 내용 */}
        <p style={{
          margin: '4px 0',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontSize: '13px',
          color: '#333',
          lineHeight: '1.5'
        }}>
          {reply.content}
        </p>

        {/* 답글 버튼 */}
        <button
          style={{
            marginTop: '4px',
            border: 'none',
            background: 'none',
            color: '#2196F3',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            padding: '0'
          }}
        >
          답글
        </button>
      </div>
    </div>
  );
};

export default ReplyItem;
