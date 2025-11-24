import React, { useState } from 'react';
import CommentItem from './CommentSystem/CommentItem';
import CommentInput from './CommentSystem/CommentInput';
import { generateId } from '../../utils/helpers';

const ActivityTab = ({
  customerId,
  activities,
  onSaveActivity,
  onDeleteActivity,
  selectedActivityId
}) => {
  const [isAdding, setIsAdding] = useState(false);

  // 데이터 정규화: followUps를 replies로 변환
  const normalizeActivity = (activity) => {
    if (!activity) return null;

    return {
      ...activity,
      author: activity.author || '나',
      replies: activity.replies || activity.followUps || []
    };
  };

  // 현재 고객의 활동 조회 및 정렬
  const customerActivities = activities
    .filter(a => a.customerId === customerId)
    .map(normalizeActivity)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // 댓글 추가
  const handleAddComment = (commentData) => {
    const newActivity = {
      id: generateId(),
      customerId,
      author: '나',
      date: new Date().toISOString().slice(0, 16), // "YYYY-MM-DD HH:mm"
      content: commentData.content,
      images: [],
      replies: []
    };

    onSaveActivity(newActivity);
    setIsAdding(false);
  };

  // 대댓글 추가
  const handleAddReply = (parentCommentId, replyData) => {
    const parentActivity = customerActivities.find(a => a.id === parentCommentId);

    if (!parentActivity) return;

    const newReply = {
      id: generateId(),
      parentId: parentCommentId,
      author: replyData.author || '나',
      mentions: replyData.mentions || [],
      content: replyData.content,
      date: new Date().toISOString().slice(0, 16),
      createdAt: new Date().toISOString()
    };

    const updatedActivity = {
      ...parentActivity,
      replies: [...(parentActivity.replies || []), newReply]
    };

    onSaveActivity(updatedActivity);
  };

  // 댓글/대댓글 편집
  const handleEditComment = (comment) => {
    // 추후 구현: 편집 모달 오픈
    console.log('편집:', comment);
  };

  // 댓글/대댓글 삭제
  const handleDeleteComment = (itemId) => {
    // 댓글 삭제 (parentId가 없으면 댓글, 있으면 대댓글)
    const parentActivity = customerActivities.find(a => a.id === itemId);

    if (parentActivity) {
      // 댓글 삭제
      onDeleteActivity(itemId);
    } else {
      // 대댓글 삭제 - 부모 활동에서 replies 배열에서 제거
      for (const activity of customerActivities) {
        const replyIndex = (activity.replies || []).findIndex(r => r.id === itemId);
        if (replyIndex !== -1) {
          const updatedActivity = {
            ...activity,
            replies: activity.replies.filter((_, idx) => idx !== replyIndex)
          };
          onSaveActivity(updatedActivity);
          break;
        }
      }
    }
  };

  return (
    <div style={{ padding: '15px' }}>
      {/* 활동 추가 버튼 */}
      <button
        onClick={() => setIsAdding(!isAdding)}
        style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '10px 16px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '600',
          marginBottom: '20px'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
      >
        + 활동 추가
      </button>

      {/* 활동 추가 입력창 */}
      {isAdding && (
        <div style={{ marginBottom: '20px' }}>
          <CommentInput
            onSubmit={handleAddComment}
            placeholder="활동을 기록하세요..."
          />
          <button
            onClick={() => setIsAdding(false)}
            style={{
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: '#f5f5f5',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            취소
          </button>
        </div>
      )}

      {/* 댓글 리스트 */}
      {customerActivities.length > 0 ? (
        <div>
          {customerActivities.map((activity) => (
            <CommentItem
              key={activity.id}
              comment={activity}
              onAddReply={handleAddReply}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
            />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#999'
        }}>
          등록된 활동이 없습니다.
        </div>
      )}
    </div>
  );
};

export default ActivityTab;
