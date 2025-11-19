import React, { useState, useRef } from 'react';
import { processCSVFile } from '../../utils/csvParser';

const DynamicCSVImporter = ({ isOpen, onClose, onImport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tableName, setTableName] = useState('');
  const [processedData, setProcessedData] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file) => {
    if (!file.name.endsWith('.csv')) {
      setError('CSV 파일만 선택할 수 있습니다.');
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      const result = await processCSVFile(file);

      if (!result.success) {
        setError(result.error);
        setProcessedData(null);
      } else {
        setProcessedData(result);
        setTableName('');
      }
    } catch (err) {
      setError(`파일 처리 오류: ${err.message}`);
      setProcessedData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateTable = () => {
    if (!tableName.trim()) {
      setError('테이블명을 입력하세요.');
      return;
    }

    const tableData = {
      name: tableName.trim(),
      columns: processedData.columns,  // CSV의 원래 컬럼 구조 유지 (label은 CSV 헤더명 사용)
      icon: '📊',
      color: '#2196F3',
      createdAt: new Date().toISOString()
    };

    onImport(tableData, processedData.data);
    resetForm();
  };

  const resetForm = () => {
    setTableName('');
    setProcessedData(null);
    setError('');
    setIsDragging(false);
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
      onClick={resetForm}
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
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>CSV 파일로 테이블 생성</h2>

        {!processedData ? (
          <>
            {/* 파일 드래그 영역 */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? '#4CAF50' : '#e0e0e0'}`,
                borderRadius: '8px',
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragging ? '#f1f8f4' : '#fafafa',
                transition: 'all 0.2s ease',
                marginBottom: '20px'
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📁</div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                CSV 파일을 여기에 드래그하세요
              </div>
              <div style={{ fontSize: '13px', color: '#999' }}>
                또는 클릭하여 파일 선택
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
            />

            {/* 지원 형식 안내 */}
            <div style={{
              backgroundColor: '#e3f2fd',
              border: '1px solid #90caf9',
              borderRadius: '4px',
              padding: '12px',
              fontSize: '13px',
              color: '#1976d2',
              marginBottom: '20px'
            }}>
              <strong>안내:</strong> 첫 번째 행은 컬럼명으로 사용됩니다. 날짜(YYYY-MM-DD), 숫자 등이 자동으로 감지됩니다.
            </div>

            {error && (
              <div style={{
                backgroundColor: '#ffebee',
                border: '1px solid #ef5350',
                borderRadius: '4px',
                padding: '12px',
                fontSize: '13px',
                color: '#d32f2f',
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}

            {isProcessing && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                <div style={{ marginBottom: '10px' }}>파일을 처리 중입니다...</div>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #f0f0f0',
                  borderTop: '3px solid #4CAF50',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }} />
              </div>
            )}

            {!isProcessing && (
              <button
                onClick={resetForm}
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
                닫기
              </button>
            )}
          </>
        ) : (
          <>
            {/* 미리보기 및 테이블명 입력 */}
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
                  border: error ? '1px solid #d32f2f' : '1px solid #e0e0e0',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontSize: '14px'
                }}
              />
              {error && (
                <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '5px' }}>
                  {error}
                </div>
              )}
            </div>

            {/* 컬럼 미리보기 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                컬럼 미리보기 ({processedData.columns.length}개)
              </label>
              <div style={{
                backgroundColor: '#f5f5f5',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                padding: '12px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                <table style={{ width: '100%', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 'bold' }}>컬럼명</th>
                      <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 'bold' }}>데이터 타입</th>
                      <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 'bold' }}>필수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedData.columns.map((col, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < processedData.columns.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                        <td style={{ padding: '6px 0' }}>{col.name}</td>
                        <td style={{ padding: '6px 0', color: '#666' }}>
                          {col.type === 'text' ? '텍스트' : col.type === 'number' ? '숫자' : '날짜'}
                        </td>
                        <td style={{ padding: '6px 0' }}>
                          {col.required ? '✓' : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 데이터 행 수 */}
            <div style={{
              backgroundColor: '#e8f5e9',
              border: '1px solid #81c784',
              borderRadius: '4px',
              padding: '12px',
              fontSize: '13px',
              color: '#2e7d32',
              marginBottom: '20px'
            }}>
              <strong>데이터:</strong> {processedData.rowCount}개의 행이 임포트됩니다.
            </div>

            {/* 액션 버튼 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setProcessedData(null)}
                style={{
                  padding: '10px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                다시 선택
              </button>
              <button
                onClick={handleCreateTable}
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
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DynamicCSVImporter;
