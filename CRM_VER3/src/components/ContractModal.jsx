import React, { useState, useEffect } from 'react';
import { CONTRACT_STATUSES } from '../constants';

const ContractModal = ({ isOpen, onClose, onSave, editData }) => {
  const getInitialState = () => ({
    id: editData?.id || null,
    createdAt: editData?.createdAt || new Date().toISOString(),
    buildingName: editData?.buildingName || '',
    roomNumber: editData?.roomNumber || '',
    contractDate: editData?.contractDate || '',
    contractorName: editData?.contractorName || '',
    contractAmount: editData?.contractAmount || 0,
    contractStatus: editData?.contractStatus || '진행중',
    memo: editData?.memo || ''
  });

  const [formData, setFormData] = useState(getInitialState());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(getInitialState());
    setErrors({});
  }, [editData, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.buildingName.trim()) newErrors.buildingName = '건물명은 필수입니다';
    if (!formData.roomNumber.trim()) newErrors.roomNumber = '호실번호는 필수입니다';
    if (!formData.contractDate.trim()) newErrors.contractDate = '계약일은 필수입니다';
    if (!formData.contractorName.trim()) newErrors.contractorName = '계약자명은 필수입니다';
    if (formData.contractAmount < 0) newErrors.contractAmount = '계약금액은 0 이상이어야 합니다';
    if (!formData.contractStatus) newErrors.contractStatus = '계약상태는 필수입니다';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'contractAmount' ? (value === '' ? 0 : Number(value)) : value
    }));

    // 오류 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const contractToSave = {
      ...formData,
      id: formData.id || `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    onSave(contractToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div className="modal-content" style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 16px rgba(0,0,0,0.2)', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #eee' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
            {editData ? '계약호실 수정' : '계약호실 추가'}
          </h2>
          <button
            onClick={onClose}
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

        {/* 폼 */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 건물명 */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              건물명 <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              type="text"
              name="buildingName"
              value={formData.buildingName}
              onChange={handleChange}
              placeholder="건물명을 입력해주세요"
              style={{
                width: '100%',
                padding: '10px',
                border: errors.buildingName ? '1px solid #f44336' : '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            {errors.buildingName && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{errors.buildingName}</div>}
          </div>

          {/* 호실번호 */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              호실번호 <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              type="text"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              placeholder="예: 101, 205"
              style={{
                width: '100%',
                padding: '10px',
                border: errors.roomNumber ? '1px solid #f44336' : '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            {errors.roomNumber && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{errors.roomNumber}</div>}
          </div>

          {/* 계약일 */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              계약일 <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              type="date"
              name="contractDate"
              value={formData.contractDate}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: errors.contractDate ? '1px solid #f44336' : '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            {errors.contractDate && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{errors.contractDate}</div>}
          </div>

          {/* 계약자명 */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              계약자명 <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              type="text"
              name="contractorName"
              value={formData.contractorName}
              onChange={handleChange}
              placeholder="계약자 이름을 입력해주세요"
              style={{
                width: '100%',
                padding: '10px',
                border: errors.contractorName ? '1px solid #f44336' : '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            {errors.contractorName && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{errors.contractorName}</div>}
          </div>

          {/* 계약금액 */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              계약금액 (만원) <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              type="number"
              name="contractAmount"
              value={formData.contractAmount}
              onChange={handleChange}
              placeholder="계약금액을 입력해주세요"
              style={{
                width: '100%',
                padding: '10px',
                border: errors.contractAmount ? '1px solid #f44336' : '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            {errors.contractAmount && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{errors.contractAmount}</div>}
          </div>

          {/* 계약상태 */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              계약상태 <span style={{ color: '#f44336' }}>*</span>
            </label>
            <select
              name="contractStatus"
              value={formData.contractStatus}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: errors.contractStatus ? '1px solid #f44336' : '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              {CONTRACT_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {errors.contractStatus && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{errors.contractStatus}</div>}
          </div>

          {/* 메모 */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              메모
            </label>
            <textarea
              name="memo"
              value={formData.memo}
              onChange={handleChange}
              placeholder="추가 사항을 입력해주세요"
              rows="3"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* 푸터 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '20px', borderTop: '1px solid #eee' }}>
          <button
            onClick={onClose}
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
            onClick={handleSubmit}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#4CAF50',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractModal;
