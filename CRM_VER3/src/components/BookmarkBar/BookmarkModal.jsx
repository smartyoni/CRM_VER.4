import React, { useState, useEffect } from 'react';

const BookmarkModal = ({
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  editingBookmark = null
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [color, setColor] = useState('#87CEEB');
  const [error, setError] = useState('');

  // 색상 팔레트
  const colors = [
    '#87CEEB', // 하늘색
    '#FFB347', // 주황색
    '#90EE90', // 연두색
    '#DDA0DD', // 자주색
    '#FFB6C1', // 핑크색
    '#FFD700', // 금색
    '#98FB98', // 연한 초록색
    '#F0E68C', // 카키색
    '#FFFFFF'  // 흰색
  ];

  // 편집 모드 시 초기값 설정
  useEffect(() => {
    if (editingBookmark) {
      setName(editingBookmark.name || '');
      setUrl(editingBookmark.url || '');
      setColor(editingBookmark.color || '#87CEEB');
      setError('');
    } else {
      setName('');
      setUrl('');
      setColor('#87CEEB');
      setError('');
    }
  }, [editingBookmark, isOpen]);

  const handleSave = () => {
    // 유효성 검사
    setError('');

    if (!name.trim()) {
      setError('이름을 입력해주세요');
      return;
    }

    if (name.length > 8) {
      setError('이름은 8글자 이내여야 합니다');
      return;
    }

    if (!url.trim()) {
      setError('URL을 입력해주세요');
      return;
    }

    // URL 유효성 검사
    try {
      new URL(url);
    } catch (e) {
      setError('올바른 URL을 입력해주세요');
      return;
    }

    // 저장
    onSave({
      id: editingBookmark?.id,
      name: name.trim(),
      url: url.trim(),
      color,
      order: editingBookmark?.order || 0,
      createdAt: editingBookmark?.createdAt
    });

    handleClose();
  };

  const handleClose = () => {
    setName('');
    setUrl('');
    setColor('#87CEEB');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 백드롭 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 999
        }}
        onClick={handleClose}
      />

      {/* 모달 */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          zIndex: 1000,
          width: '90%',
          maxWidth: '500px',
          padding: '30px'
        }}
      >
        {/* 제목 */}
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold' }}>
          {editingBookmark ? '북마크 수정' : '북마크 추가'}
        </h2>

        {/* 에러 메시지 */}
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        {/* 폼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* 이름 입력 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>
              이름 (8글자 이내):
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 8))}
              placeholder="북마크 이름을 입력하세요"
              style={{
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
            <span style={{ fontSize: '12px', color: '#999' }}>
              {name.length} / 8
            </span>
          </div>

          {/* URL 입력 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>
              URL:
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              style={{
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* 색상 선택 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>
              색상:
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '4px',
                    backgroundColor: c,
                    border: color === c ? '3px solid #333' : '1px solid #ccc',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
          marginTop: '25px'
        }}>
          <button
            onClick={handleClose}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#45a049';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4CAF50';
            }}
          >
            저장
          </button>
        </div>
      </div>
    </>
  );
};

export default BookmarkModal;
