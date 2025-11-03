import React, { useRef, useState } from 'react';
import { parseBuildingCSV } from '../utils/csvParser';

const BuildingImporter = ({ onImport, onClose }) => {
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
      let buildings = parseBuildingCSV(text);

      // CSV 내 중복 검사 (건물명 + 지번)
      const uniqueMap = new Map();
      const duplicates = [];
      const uniqueBuildings = [];

      buildings.forEach(building => {
        const key = `${building.name}_${building.address}`.toLowerCase();
        if (uniqueMap.has(key)) {
          duplicates.push(building);
        } else {
          uniqueMap.set(key, true);
          uniqueBuildings.push(building);
        }
      });

      // 중복이 발견되면 경고
      if (duplicates.length > 0) {
        setError(`⚠️ CSV 파일 내에 ${duplicates.length}개의 중복된 건물이 발견되어 제외되었습니다.`);
      }

      // 미리보기: 처음 3개 항목만 표시
      setPreviewData({
        total: uniqueBuildings.length,
        preview: uniqueBuildings.slice(0, 3),
        all: uniqueBuildings,
        duplicatesRemoved: duplicates.length
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
      alert(`${previewData.total}개의 건물이 성공적으로 임포트되었습니다.`);
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
          <h3>건물정보 CSV 임포트</h3>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* 경고 메시지 */}
          <div style={{ backgroundColor: '#fff3e0', padding: '12px', borderRadius: '4px', fontSize: '13px', color: '#e65100', border: '1px solid #ffb74d' }}>
            <strong>⚠️ 주의:</strong> CSV 임포트 시 <strong>기존의 모든 건물 데이터가 삭제</strong>되고 새로운 데이터로 대체됩니다.
          </div>

          {/* 안내 텍스트 */}
          <div style={{ backgroundColor: '#e3f2fd', padding: '12px', borderRadius: '4px', fontSize: '13px', color: '#1565c0' }}>
            <strong>CSV 파일 형식:</strong><br/>
            다음 열을 포함해야 합니다 (헤더 필수): 건물명, 지번, 사용승인일, 층수, 주차, 세대수, 공동현관, 관리실, 위치, 유형, 메모
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
                ✅ {previewData.total}개의 건물을 임포트할 준비가 되었습니다
                {previewData.duplicatesRemoved > 0 && (
                  <span style={{ color: '#ff9800', fontSize: '12px', marginLeft: '8px' }}>
                    ({previewData.duplicatesRemoved}개 중복 제외됨)
                  </span>
                )}
              </div>

              <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                      <th style={{ padding: '6px', textAlign: 'left' }}>건물명</th>
                      <th style={{ padding: '6px', textAlign: 'left' }}>지번</th>
                      <th style={{ padding: '6px', textAlign: 'left' }}>위치</th>
                      <th style={{ padding: '6px', textAlign: 'left' }}>유형</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.preview.map((building, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '6px' }}>{building.name}</td>
                        <td style={{ padding: '6px' }}>{building.address || '-'}</td>
                        <td style={{ padding: '6px' }}>{building.location || '-'}</td>
                        <td style={{ padding: '6px' }}>{building.type || '-'}</td>
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

export default BuildingImporter;
