import React, { useState } from 'react';

const DynamicRowModal = ({ isOpen, onClose, onSave, tableMetadata }) => {
  const [formData, setFormData] = useState({});

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
    // 시간 기반 컬럼 자동 입력
    const autoFilledData = { ...formData };

    // 디버그: 컬럼 정보 로깅
    console.log('=== DynamicRowModal Debug ===');
    console.log('displayColumns:', displayColumns);
    console.log('formData:', formData);

    // 컬럼 메타데이터를 순회하며 시간 기반 컬럼 감지 및 자동 입력
    displayColumns.forEach(col => {
      const colName = col.name.toLowerCase();
      const colLabel = (col.label || '').toLowerCase();

      console.log(`Column: name="${col.name}", label="${col.label}", type="${col.type}"`);
      console.log(`  colName.toLowerCase()="${colName}", colLabel="${colLabel}"`);

      // 접수일 패턴: createdAt, created_at (날짜만 YYYY-MM-DD)
      if ((colName === 'createdat' || colName === 'created_at') && !autoFilledData[col.name]) {
        const now = new Date();
        autoFilledData[col.name] = now.toISOString().split('T')[0]; // YYYY-MM-DD
      }

      // 기록일시 패턴 1: 영문 (recordedAt, recorded_at, loggedAt, logged_at)
      if ((colName === 'recordedat' || colName === 'recorded_at' ||
           colName === 'loggedat' || colName === 'logged_at') && !autoFilledData[col.name]) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        autoFilledData[col.name] = `${year}-${month}-${date} ${hours}:${minutes}`; // YYYY-MM-DD HH:MM
      }

      // 기록일시 패턴 2: 한글 또는 키워드 포함 (기록일시, 로그시간, 기록시간 등)
      // 컬럼명이나 라벨에 "기록", "일시", "로그", "시간" 등의 키워드 포함
      const isRecordTimeColumn =
        colName.includes('기록') || colName.includes('로그') || colName.includes('기록일시') ||
        colLabel.includes('기록') || colLabel.includes('로그') || colLabel.includes('기록일시') ||
        colName.includes('recordtime') || colName.includes('record_time') ||
        colLabel.includes('recordtime') || colLabel.includes('record_time');

      console.log(`  isRecordTimeColumn=${isRecordTimeColumn}, type check=${col.type === 'text' || !col.type}, hasValue=${!!autoFilledData[col.name]}`);

      if (isRecordTimeColumn && (col.type === 'text' || !col.type) && !autoFilledData[col.name]) {
        // 컬럼에 이미 값이 있으면 건너뛰기
        if (!autoFilledData[col.name]) {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const date = String(now.getDate()).padStart(2, '0');
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');
          const autoValue = `${year}-${month}-${date} ${hours}:${minutes}`;
          autoFilledData[col.name] = autoValue;
          console.log(`  ✓ Auto-filled: ${col.name} = "${autoValue}"`);
        }
      }
    });

    // ID와 createdAt은 자동 생성
    const newRow = {
      id: `row_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...autoFilledData
    };

    console.log('Final newRow:', newRow);
    console.log('=== End Debug ===');

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
