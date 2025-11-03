import React, { useRef, useState } from 'react';
import { parsePropertyCSV } from '../utils/csvParser';

const PropertyImporter = ({ onImport, onClose }) => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    setLoading(true);
    setPreviewData(null);

    try {
      const text = await file.text();
      const properties = parsePropertyCSV(text);

      // 미리보기: 처음 3개 항목만 표시
      setPreviewData({
        total: properties.length,
        preview: properties.slice(0, 3),
        all: properties
      });
    } catch (err) {
      setError(`파일 파싱 오류: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImportConfirm = async () => {
    if (!previewData) return;

    setLoading(true);
    try {
      await onImport(previewData.all);
      alert(`${previewData.total}개의 매물이 성공적으로 임포트되었습니다.`);
      onClose();
    } catch (err) {
      setError(`임포트 오류: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '90vh' }}>
        <div className="modal-header">
          <h3>매물 데이터 CSV 임포트</h3>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* 안내 텍스트 */}
          <div style={{ backgroundColor: '#e3f2fd', padding: '12px', borderRadius: '4px', fontSize: '13px', color: '#1565c0' }}>
            <strong>CSV 파일 형식:</strong><br/>
            다음 열을 포함해야 합니다 (헤더 필수): 건물명, 호실명, 매물유형, 구분, 금액, 입주일, 소유자, 소유자번호, 임대차정보, 점주번호, 메모
          </div>

          {/* 파일 선택 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              CSV 파일 선택
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv"
              disabled={loading}
              style={{
                padding: '8px',
                border: '2px solid #ddd',
                borderRadius: '4px',
                width: '100%',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div style={{
              backgroundColor: '#ffebee',
              padding: '12px',
              borderRadius: '4px',
              color: '#c62828',
              fontSize: '13px',
              border: '1px solid #ef5350'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* 미리보기 */}
          {previewData && (
            <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2196F3' }}>
                ✅ {previewData.total}개의 매물을 임포트할 준비가 되었습니다
              </div>

              <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                      <th style={{ padding: '6px', textAlign: 'left' }}>건물명</th>
                      <th style={{ padding: '6px', textAlign: 'left' }}>호실명</th>
                      <th style={{ padding: '6px', textAlign: 'left' }}>유형</th>
                      <th style={{ padding: '6px', textAlign: 'left' }}>금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.preview.map((prop, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '6px' }}>{prop.buildingName}</td>
                        <td style={{ padding: '6px' }}>{prop.roomNumber || '-'}</td>
                        <td style={{ padding: '6px' }}>{prop.propertyType}</td>
                        <td style={{ padding: '6px', textAlign: 'right' }}>{prop.price ? `${prop.price}만` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {previewData.total > 3 && (
                <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                  ... 외 {previewData.total - 3}개
                </div>
              )}
            </div>
          )}

          {/* 로딩 상태 */}
          {loading && (
            <div style={{ textAlign: 'center', color: '#999' }}>
              처리 중...
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="modal-footer">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-secondary"
          >
            취소
          </button>
          <button
            onClick={handleImportConfirm}
            disabled={!previewData || loading}
            className="btn-primary"
            style={{
              opacity: !previewData || loading ? 0.6 : 1,
              cursor: !previewData || loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '임포트 중...' : '임포트 확인'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyImporter;
