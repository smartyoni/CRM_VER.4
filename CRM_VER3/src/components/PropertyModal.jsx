import React, { useState, useEffect } from 'react';
import { generateId } from '../utils/helpers';

const PropertyModal = ({ isOpen, onClose, onSave, editData }) => {
  const PROPERTY_TYPES = ['매매', '임대'];
  const CATEGORIES = ['오피스텔', '오피스', '상가', '지산', '아파트'];

  const getInitialState = () => ({
    id: editData?.id || null,
    createdAt: editData?.createdAt || new Date().toISOString(),
    propertyType: editData?.propertyType || PROPERTY_TYPES[0],
    category: editData?.category || CATEGORIES[0],
    buildingName: editData?.buildingName || '',
    roomNumber: editData?.roomNumber || '',
    price: editData?.price || '',
    moveInDate: editData?.moveInDate || '',
    ownerName: editData?.ownerName || '',
    ownerPhone: editData?.ownerPhone || '',
    leaseInfo: editData?.leaseInfo || '',
    tenantPhone: editData?.tenantPhone || '',
    memo: editData?.memo || '',
  });

  const [formData, setFormData] = useState(getInitialState());
  const [parseText, setParseText] = useState('');

  useEffect(() => {
    setFormData(getInitialState());
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e, fieldName) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 3 && value.length <= 7) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length > 7) {
      value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = () => {
    if (!formData.buildingName.trim()) {
      alert('건물명을 입력해주세요.');
      return;
    }

    const propertyToSave = {
      ...formData,
      id: formData.id || generateId(),
      price: parseInt(formData.price, 10) || 0,
      createdAt: formData.createdAt || new Date().toISOString(),
    };

    onSave(propertyToSave);
    onClose();
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 파싱 함수
  const handleParse = () => {
    try {
      const lines = parseText.split('\n').map(l => l.trim()).filter(l => l);

      // 컬럼명 목록 (파싱 대상 제외)
      const columnNames = ['매물명', '금액', '입주일(만기일)', '입주일자', '임대인이름', '임대인번호', '임차인번호', '비밀번호', '매물정보'];

      // Key-Value 추출 헬퍼 함수 (컬럼명 직후의 값 추출)
      const getValueAfterKey = (key) => {
        const index = lines.findIndex(line => line === key); // 정확히 일치하는 컬럼명만
        if (index !== -1 && index + 1 < lines.length) {
          const nextLine = lines[index + 1];
          // 다음 줄이 컬럼명이면 공백 반환
          if (columnNames.includes(nextLine)) {
            return '';
          }
          return nextLine;
        }
        return '';
      };

      const parsed = {};

      // 1. 매물명 파싱 (건물명 + 호실명 분리)
      const propertyName = getValueAfterKey('매물명');
      const nameMatch = propertyName.match(/^(.+?)\s+(\d+호)/);
      if (nameMatch) {
        parsed.buildingName = nameMatch[1].trim();
        parsed.roomNumber = nameMatch[2].trim();
      } else {
        parsed.buildingName = propertyName;
        parsed.roomNumber = '';
      }

      // 2. 금액 파싱 (숫자만 추출)
      const priceText = getValueAfterKey('금액');
      parsed.price = priceText.replace(/[^0-9]/g, '') || '';

      // 3. 입주일 파싱 (MM/DD/YYYY → YYYY-MM-DD)
      const moveInText = getValueAfterKey('입주일(만기일)');
      const dateMatch = moveInText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (dateMatch) {
        // MM/DD/YYYY → YYYY-MM-DD
        parsed.moveInDate = `${dateMatch[3]}-${dateMatch[1]}-${dateMatch[2]}`;
      }

      // 4. 임대인(소유자) 정보
      const ownerNameValue = getValueAfterKey('임대인이름');
      parsed.ownerName = ownerNameValue; // 임대인이름 그대로 사용
      parsed.ownerPhone = getValueAfterKey('임대인번호');

      // 5. 임차인(점주) 번호
      parsed.tenantPhone = getValueAfterKey('임차인번호');

      // 6. 메모 (매물정보 이후 모든 내용)
      const memoStartIndex = lines.findIndex(line => line === '매물정보');
      if (memoStartIndex !== -1) {
        parsed.memo = lines.slice(memoStartIndex + 1).join('\n').trim();
      }

      // 7. 폼 데이터 업데이트
      setFormData(prev => ({
        ...prev,
        ...parsed,
        createdAt: new Date().toISOString() // 접수일은 자동
      }));

      // 8. 파싱 완료 알림 및 텍스트 초기화
      alert('파싱이 완료되었습니다!');
      setParseText('');

    } catch (error) {
      alert('파싱 중 오류가 발생했습니다: ' + error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', paddingBottom: '10px' }}>
          <h3>{editData ? '매물 수정' : '매물 추가'}</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', marginBottom: 0 }}>매물유형</label>
            <select name="propertyType" value={formData.propertyType} onChange={handleChange} style={{ fontSize: '14px' }}>
              {PROPERTY_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <label style={{ fontSize: '14px', marginBottom: 0 }}>구분</label>
            <select name="category" value={formData.category} onChange={handleChange} style={{ fontSize: '14px' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={onClose} className="btn-close">✕</button>
          </div>
        </div>

        {/* 빠른 입력 - 텍스트 파싱 */}
        <div className="form-group">
          <label>🚀 빠른 입력 (앱시트 데이터 붙여넣기)</label>
          <textarea
            placeholder="앱시트에서 복사한 내용을 붙여넣으세요..."
            value={parseText}
            onChange={(e) => setParseText(e.target.value)}
            rows="8"
            style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              resize: 'vertical'
            }}
          />
          <button
            type="button"
            onClick={handleParse}
            className="btn-primary"
            style={{
              marginTop: '8px',
              width: '100%',
              backgroundColor: '#FF6B9D',
              padding: '10px'
            }}
          >
            📋 파싱하여 자동 입력
          </button>
        </div>

        {/* 건물명과 호실명 */}
        <div className="form-grid">
          <div className="form-group">
            <label>건물명 *</label>
            <input type="text" name="buildingName" value={formData.buildingName} onChange={handleChange} placeholder="건물명 입력" required />
          </div>
          <div className="form-group">
            <label>호실명</label>
            <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} placeholder="호실명 입력" />
          </div>
        </div>

        {/* 금액과 입주일 */}
        <div className="form-grid">
          <div className="form-group">
            <label>금액 (만원)</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="금액 입력" />
          </div>
          <div className="form-group">
            <label>입주일</label>
            <input type="date" name="moveInDate" value={formData.moveInDate} onChange={handleDateChange} />
          </div>
        </div>

        {/* 소유자 정보 */}
        <div className="form-grid">
          <div className="form-group">
            <label>소유자</label>
            <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="소유자명 입력" />
          </div>
          <div className="form-group">
            <label>소유자번호</label>
            <input
              type="tel"
              name="ownerPhone"
              value={formData.ownerPhone}
              onChange={(e) => handlePhoneChange(e, 'ownerPhone')}
              placeholder="010-xxxx-xxxx"
            />
          </div>
        </div>

        {/* 임대차정보와 점주번호 */}
        <div className="form-grid">
          <div className="form-group">
            <label>임대차정보</label>
            <input type="text" name="leaseInfo" value={formData.leaseInfo} onChange={handleChange} placeholder="임대차 정보 입력" />
          </div>
          <div className="form-group">
            <label>점주번호</label>
            <input
              type="tel"
              name="tenantPhone"
              value={formData.tenantPhone}
              onChange={(e) => handlePhoneChange(e, 'tenantPhone')}
              placeholder="010-xxxx-xxxx"
            />
          </div>
        </div>

        {/* 메모 */}
        <div className="form-group">
          <label>메모</label>
          <textarea name="memo" value={formData.memo} onChange={handleChange} rows="3" placeholder="메모를 입력하세요"></textarea>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">취소</button>
          <button onClick={handleSubmit} className="btn-primary">저장</button>
        </div>
      </div>
    </div>
  );
};

export default PropertyModal;
