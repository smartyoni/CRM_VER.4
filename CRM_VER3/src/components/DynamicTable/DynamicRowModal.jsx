import React, { useState, useEffect } from 'react';

const DynamicRowModal = ({ isOpen, onClose, onSave, tableMetadata }) => {
  const [formData, setFormData] = useState({});

  // 모달이 열릴 때 시간 기반 컬럼 자동 채우기
  useEffect(() => {
    if (isOpen && tableMetadata) {
      const columns = tableMetadata.columns || [];
      const displayColumns = columns.filter(col => col.display !== false);
      const autoInitialData = {};
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const date = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const timeString = `${year}-${month}-${date} ${hours}:${minutes}`;
      const dateString = `${year}-${month}-${date}`; // 날짜만

      displayColumns.forEach(col => {
        const colName = col.name.toLowerCase();
        const colLabel = (col.label || '').toLowerCase();

        // date 타입이고 "기록일자" 또는 "기록" + "일자" 포함하면 자동으로 오늘 날짜
        if (col.type === 'date' &&
            ((colName.includes('기록') && colName.includes('일자')) ||
             (colLabel.includes('기록') && colLabel.includes('일자')) ||
             colName === '기록일자' || colLabel === '기록일자')) {
          autoInitialData[col.name] = dateString;
        }
        // 기록일시 관련 컬럼 감지: 컬럼명이나 라벨에 "기록", "일시", "로그" 포함
        else if ((colName.includes('기록') || colLabel.includes('기록') ||
                  colName.includes('일시') || colLabel.includes('일시') ||
                  colName.includes('로그') || colLabel.includes('로그')) &&
                 (col.type === 'text' || !col.type)) {
          autoInitialData[col.name] = timeString;
        }
      });

      setFormData(autoInitialData);
    }
  }, [isOpen, tableMetadata]);

  // early return을 JSX에서 조건부 렌더링으로 변경
  if (!isOpen || !tableMetadata) return null;

  const columns = tableMetadata.columns || [];
  const displayColumns = columns.filter(col => col.display !== false);

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSave = () => {
    // ID와 createdAt은 자동 생성
    const newRow = {
      id: `row_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...formData  // 이미 자동으로 채워진 시간 기반 필드 포함
    };

    onSave(newRow);
    setFormData({});
  };

  const handleClose = () => {
    setFormData({});
    onClose();
  };

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
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          padding: '30px'
        }}
      >
        {/* 헤더 */}
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold' }}>
          {tableMetadata.name} - 행 추가
        </h2>

        {/* 폼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {displayColumns.map(col => (
            <div key={col.name} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#333'
                }}
              >
                {col.label || col.name}
                {col.required && <span style={{ color: '#f44336' }}>*</span>}
              </label>
              <input
                type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                placeholder={`${col.label || col.name}을(를) 입력하세요`}
                value={formData[col.name] || ''}
                onChange={(e) => handleInputChange(col.name, e.target.value)}
                style={{
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          ))}
        </div>

        {/* 버튼 */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
            marginTop: '25px'
          }}
        >
          <button
            onClick={handleClose}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
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
              cursor: 'pointer'
            }}
          >
            추가
          </button>
        </div>
      </div>
    </>
  );
};

export default DynamicRowModal;
