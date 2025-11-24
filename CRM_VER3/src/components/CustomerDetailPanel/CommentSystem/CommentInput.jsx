import React, { useState, useRef } from 'react';

const CommentInput = ({ onSubmit, placeholder = "댓글을 입력하세요. (엔터 멘션을 먼저할 수 있어요!)" }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleSubmit = () => {
    if (!content.trim() && images.length === 0) return;

    onSubmit({
      content: content.trim(),
      mentions: [],
      images: images
    });

    setContent('');
    setImages([]);
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 1MB 제한
      if (file.size > 1024 * 1024) {
        alert('파일 크기가 1MB를 초과합니다.');
        continue;
      }

      // 이미지 파일만 허용
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 첨부할 수 있습니다.');
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, {
          url: event.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    }

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter로 전송
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '12px',
      backgroundColor: '#fff',
      marginTop: '20px'
    }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          minHeight: '60px',
          resize: 'none',
          fontFamily: 'inherit',
          fontSize: '13px',
          padding: '0',
          color: '#333'
        }}
      />

      {/* 선택된 이미지 미리보기 */}
      {images.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '12px',
          flexWrap: 'wrap'
        }}>
          {images.map((img, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <img
                src={img.url}
                alt={img.name}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0'
                }}
              />
              <button
                onClick={() => handleRemoveImage(idx)}
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0'
                }}
                title="제거"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e3f2fd';
              e.currentTarget.style.color = '#2196F3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#666';
            }}
            title="사진 첨부 (JPG, PNG, GIF 등 / 최대 1MB)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 21H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"></path>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
              <path d="M22 22v-4h-4"></path>
              <path d="M22 18v4h-4"></path>
            </svg>
          </button>
        </div>

        <button
          onClick={handleSubmit}
          style={{
            backgroundColor: (content.trim() || images.length > 0) ? '#2196F3' : '#ccc',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: (content.trim() || images.length > 0) ? 'pointer' : 'default',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
          disabled={!content.trim() && images.length === 0}
        >
          입력
        </button>
      </div>
    </div>
  );
};

export default CommentInput;
