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
    // ID와 createdAt은 자동 생성
    const newRow = {
      id: `row_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...formData
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
