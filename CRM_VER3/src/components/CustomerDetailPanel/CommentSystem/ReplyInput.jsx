import React, { useState } from 'react';

const ReplyInput = ({ parentAuthor, onSubmit, onCancel }) => {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;

    onSubmit({
      content: content.trim(),
      mentions: parentAuthor ? [parentAuthor] : []
    });

    setContent('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div style={{
      marginTop: '12px',
      marginLeft: '52px',
      padding: '12px',
      backgroundColor: '#fafafa',
      borderRadius: '8px',
      border: '1px solid #e0e0e0'
    }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`${parentAuthor}에게 답글 입력... (Esc 취소)`}
        autoFocus
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          minHeight: '50px',
          resize: 'none',
          fontFamily: 'inherit',
          fontSize: '13px',
          padding: '0',
          backgroundColor: 'transparent',
          color: '#333'
        }}
      />

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid #e0e0e0'
      }}>
        <button
          onClick={onCancel}
          style={{
            backgroundColor: '#f5f5f5',
            color: '#666',
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          취소
        </button>

        <button
          onClick={handleSubmit}
          style={{
            backgroundColor: content.trim() ? '#2196F3' : '#ccc',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            cursor: content.trim() ? 'pointer' : 'default',
            fontSize: '12px',
            fontWeight: '600'
          }}
          disabled={!content.trim()}
        >
          입력
        </button>
      </div>
    </div>
  );
};

export default ReplyInput;
