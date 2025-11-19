import React, { useState } from 'react';

const TableCreator = ({ isOpen, onClose, onCreateTable }) => {
  const [mode, setMode] = useState(null); // 'manual', 'csv', null
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([
    { name: '', type: 'text', required: false, display: true }
  ]);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleAddColumn = () => {
    setColumns([...columns, { name: '', type: 'text', required: false, display: true }]);
  };

  const handleRemoveColumn = (index) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  const validateManualTable = () => {
    const newErrors = {};

    if (!tableName.trim()) {
      newErrors.tableName = '테이블명은 필수입니다.';
    }

    const validColumns = columns.filter(col => col.name.trim());
    if (validColumns.length === 0) {
      newErrors.columns = '최소 1개의 컬럼이 필요합니다.';
    }

    validColumns.forEach((col, index) => {
      if (!col.name.trim()) {
        newErrors[`column_${index}_name`] = '컬럼명은 필수입니다.';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateManualTable = () => {
    if (!validateManualTable()) return;

    const validColumns = columns.filter(col => col.name.trim());
    const tableData = {
      name: tableName.trim(),
      columns: validColumns.map(col => ({
        name: col.name.trim(),
        type: col.type,
        required: col.required,
        display: col.display
      })),
      icon: '📊',
      color: '#4CAF50',
      createdAt: new Date().toISOString()
    };

    onCreateTable(tableData, 'manual');
    resetForm();
  };

  const resetForm = () => {
    setTableName('');
    setColumns([{ name: '', type: 'text', required: false, display: true }]);
    setErrors({});
    setMode(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모드 선택 화면 */}
        {mode === null && (
          <>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>테이블 추가</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              새로운 테이블을 만드는 방식을 선택하세요.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <button
                onClick={() => setMode('manual')}
                style={{
                  padding: '20px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f0f0f0';
                  e.target.style.borderColor = '#4CAF50';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f9f9f9';
                  e.target.style.borderColor = '#e0e0e0';
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>✏️</div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>수동 정의</div>
                <div style={{ fontSize: '12px', color: '#999' }}>컬럼을 직접 정의하여 테이블 생성</div>
              </button>
              <button
                onClick={() => setMode('csv')}
                style={{
                  padding: '20px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f0f0f0';
                  e.target.style.borderColor = '#2196F3';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f9f9f9';
                  e.target.style.borderColor = '#e0e0e0';
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>📊</div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>CSV 임포트</div>
                <div style={{ fontSize: '12px', color: '#999' }}>CSV 파일 업로드로 자동 생성</div>
              </button>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              취소
            </button>
          </>
        )}

        {/* 수동 정의 화면 */}
        {mode === 'manual' && (
          <>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>테이블 수동 정의</h2>

            {/* 테이블명 입력 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                테이블명 *
              </label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="예: 거래처 정보"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${errors.tableName ? '#d32f2f' : '#e0e0e0'}`,
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontSize: '14px'
                }}
              />
              {errors.tableName && (
                <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '5px' }}>
                  {errors.tableName}
                </div>
              )}
            </div>

            {/* 컬럼 정의 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                컬럼 정의 *
              </label>
              {errors.columns && (
                <div style={{ color: '#d32f2f', fontSize: '12px', marginBottom: '10px' }}>
                  {errors.columns}
                </div>
              )}
              {columns.map((col, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 30px', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
                  <div>
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                      placeholder="컬럼명"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: `1px solid ${errors[`column_${index}_name`] ? '#d32f2f' : '#e0e0e0'}`,
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontSize: '13px'
                      }}
                    />
                    {errors[`column_${index}_name`] && (
                      <div style={{ color: '#d32f2f', fontSize: '11px', marginTop: '3px' }}>
                        {errors[`column_${index}_name`]}
                      </div>
                    )}
                  </div>
                  <select
                    value={col.type}
                    onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                    style={{
                      padding: '8px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}
                  >
                    <option value="text">텍스트</option>
                    <option value="number">숫자</option>
                    <option value="date">날짜</option>
                  </select>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={col.required}
                      onChange={(e) => handleColumnChange(index, 'required', e.target.checked)}
                    />
                    필수
                  </label>
                  <button
                    onClick={() => handleRemoveColumn(index)}
                    style={{
                      padding: '6px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      backgroundColor: '#ffebee',
                      cursor: 'pointer',
                      color: '#d32f2f',
                      fontSize: '16px'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddColumn}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px dashed #4CAF50',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  color: '#4CAF50',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                + 컬럼 추가
              </button>
            </div>

            {/* 액션 버튼 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setMode(null)}
                style={{
                  padding: '10px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                뒤로
              </button>
              <button
                onClick={handleCreateManualTable}
                style={{
                  padding: '10px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                생성
              </button>
            </div>
          </>
        )}

        {/* CSV 임포트 화면 */}
        {mode === 'csv' && (
          <>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>CSV 파일로 테이블 생성</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              다음 단계로 진행되어 CSV 파일을 업로드할 수 있습니다.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setMode(null)}
                style={{
                  padding: '10px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                뒤로
              </button>
              <button
                onClick={() => {
                  onCreateTable(null, 'csv');
                  resetForm();
                }}
                style={{
                  padding: '10px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                계속
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TableCreator;
