import React, { useState } from 'react';
import ReplyInput from './ReplyInput';
import ReplyItem from './ReplyItem';

const CommentItem = ({
  comment,
  onAddReply,
  onEditComment,
  onDeleteComment
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRepliesExpanded, setIsRepliesExpanded] = useState(true);

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

  const handleAddReply = (replyData) => {
    onAddReply(comment.id, replyData);
    setShowReplyInput(false);
  };

  return (
    <div className="comment-item">
      {/* 댓글 메인 */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {/* 헤더: 날짜 + 메뉴 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#2196F3' }}>
                {formatDateTime(comment.date)}
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
                      onEditComment(comment);
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
                      if (window.confirm('댓글을 삭제하시겠습니까?')) {
                        onDeleteComment(comment.id);
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

          {/* 댓글 내용 */}
          <p style={{
            margin: '0 0 8px 0',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#333',
            lineHeight: '1.5'
          }}>
            {comment.content}
          </p>

          {/* 첨부 이미지 */}
          {comment.images && comment.images.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '8px',
              flexWrap: 'wrap'
            }}>
              {comment.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={img.name}
                  style={{
                    maxWidth: '120px',
                    maxHeight: '120px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.open(img.url, '_blank')}
                />
              ))}
            </div>
          )}

          {/* 답글 버튼 + 답글 개수 접기/펼치기 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              style={{
                border: 'none',
                background: 'none',
                color: '#9C27B0',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                padding: '0'
              }}
            >
              답글
            </button>

            {/* 답글 접기/펼치기 버튼 */}
            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setIsRepliesExpanded(!isRepliesExpanded)}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '11px' }}>{isRepliesExpanded ? '▼' : '▶'}</span>
                <span>답글 {comment.replies.length}개 {isRepliesExpanded ? '숨기기' : '보기'}</span>
              </button>
            )}
          </div>

          {/* 대댓글 리스트 */}
          {isRepliesExpanded && comment.replies && comment.replies.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              {comment.replies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  parentCommentId={comment.id}
                  parentAuthor={comment.author}
                  onDeleteReply={onDeleteComment}
                  onEditReply={onEditComment}
                />
              ))}
            </div>
          )}

          {/* 답글 입력창 */}
          {showReplyInput && (
            <ReplyInput
              parentAuthor={comment.author}
              onSubmit={handleAddReply}
              onCancel={() => setShowReplyInput(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
