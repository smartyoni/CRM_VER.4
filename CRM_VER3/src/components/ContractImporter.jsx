import React, { useRef, useState } from 'react';
import { parseContractCSV } from '../utils/csvParser';

const ContractImporter = ({ onImport, onClose }) => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('CSV 파일만 선택할 수 있습니다.');
      return;
    }

    setLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csvText = e.target.result;
        const parsedData = parseContractCSV(csvText);

        setPreviewData({
          all: parsedData,
          preview: parsedData.slice(0, 3),
          total: parsedData.length
        });
        setError('');
      } catch (err) {
        setError(err.message || 'CSV 파일 파싱에 실패했습니다.');
        setPreviewData(null);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('파일을 읽을 수 없습니다.');
      setLoading(false);
    };

    reader.readAsText(file);
  };

  const handleImportConfirm = async () => {
    if (!previewData) return;

    try {
      setLoading(true);
      await onImport(previewData.all);
      alert(`${previewData.total}개의 계약호실이 임포트되었습니다.`);
      onClose();
    } catch (err) {
      setError(err.message || '임포트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!previewData) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '40px', maxWidth: '600px', width: '90%' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>계약호실 CSV 임포트</h2>

          <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
            <p style={{ margin: '0 0 12px 0' }}>CSV 형식:</p>
            <code style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px', display: 'block', fontSize: '12px', overflow: 'auto', marginBottom: '12px' }}>
              건물명,호실명,진행상황,매물관리,만기관리,계약서작성일,잔금일,만기일,임대인이름,임대인번호,임차인이름,임차인번호
            </code>
            <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
              필수 필드: 건물명, 호실명<br />
              날짜 형식: YYYY-MM-DD (예: 2025-08-13)<br />
              진행상황: 계약서작성, 잔금, 입주완료, 퇴실함, 계약이력없음
            </p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv"
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 20px',
                border: '2px dashed #ddd',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                transition: 'all 0.2s'
              }}
            >
              {loading ? '파일 읽는 중...' : 'CSV 파일 선택'}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '12px 20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #eee' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>계약호실 임포트 미리보기</h2>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: 0
            }}
          >
            ✕
          </button>
        </div>

        {/* 콘텐츠 */}
        <div style={{ padding: '20px' }}>
          {/* 경고 메시지 */}
          <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', color: '#856404', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '13px' }}>
            ⚠️ 기존 계약호실 데이터는 모두 삭제되고 새 데이터로 교체됩니다.
          </div>

          {/* 통계 */}
          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#2e7d32' }}>
              총 {previewData.total}개의 계약호실을 임포트합니다 (미리보기: {previewData.preview.length}개)
            </p>
          </div>

          {/* 미리보기 테이블 */}
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderRight: '1px solid #ddd' }}>건물명</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderRight: '1px solid #ddd' }}>호실명</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderRight: '1px solid #ddd' }}>진행상황</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderRight: '1px solid #ddd' }}>임차인</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>임대인</th>
                </tr>
              </thead>
              <tbody>
                {previewData.preview.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? '#fff' : '#f5f5f5' }}>
                    <td style={{ padding: '10px', borderRight: '1px solid #ddd' }}>{item.buildingName || '-'}</td>
                    <td style={{ padding: '10px', borderRight: '1px solid #ddd' }}>{item.roomName || '-'}</td>
                    <td style={{ padding: '10px', borderRight: '1px solid #ddd' }}>{item.progressStatus || '-'}</td>
                    <td style={{ padding: '10px', borderRight: '1px solid #ddd' }}>{item.tenantName || '-'}</td>
                    <td style={{ padding: '10px' }}>{item.landlordName || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && (
            <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>
              {error}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '20px', borderTop: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            취소
          </button>
          <button
            onClick={handleImportConfirm}
            disabled={loading}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: loading ? '#ccc' : '#4CAF50',
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {loading ? '임포트 중...' : '임포트 확인'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractImporter;
