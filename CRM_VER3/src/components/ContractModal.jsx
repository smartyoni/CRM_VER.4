import React, { useState, useEffect } from 'react';

// FormField 컴포넌트를 외부에 정의하여 매 렌더링마다 재생성되지 않도록 함
// 이를 통해 한글 IME 입력이 정상적으로 작동함
const FormField = ({ label, name, type = 'text', value, placeholder = '', required = false, options = null, onChange, errors }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
      {label} {required && <span style={{ color: '#f44336' }}>*</span>}
    </label>
    {options ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '10px',
          border: errors[name] ? '1px solid #f44336' : '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
      >
        <option value="">선택하세요</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px',
          border: errors[name] ? '1px solid #f44336' : '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
      />
    )}
    {errors[name] && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{errors[name]}</div>}
  </div>
);

const ContractModal = ({ isOpen, onClose, onSave, editData, buildings = [] }) => {
  // 날짜 형식 변환 헬퍼 함수
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    // 이미 YYYY-MM-DD 형식이면 그대로 반환
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // ISO 형식(YYYY-MM-DDTHH:mm:ss)에서 날짜 부분만 추출
    if (dateStr.includes('T')) return dateStr.split('T')[0];
    return dateStr;
  };

  const getInitialState = (data) => ({
    id: data?.id || null,
    createdAt: data?.createdAt || new Date().toISOString(),
    buildingName: data?.buildingName || '',
    roomName: data?.roomName || '',
    contractDate: formatDateForInput(data?.contractDate) || '',
    balanceDate: formatDateForInput(data?.balanceDate) || '',
    expiryDate: formatDateForInput(data?.expiryDate) || '',
    landlordName: data?.landlordName || '',
    landlordPhone: data?.landlordPhone || '',
    tenantName: data?.tenantName || '',
    tenantPhone: data?.tenantPhone || ''
  });

  const [formData, setFormData] = useState(() => getInitialState(editData));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState(editData));
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.buildingName.trim()) newErrors.buildingName = '건물명은 필수입니다';
    if (!formData.roomName.trim()) newErrors.roomName = '호실명은 필수입니다';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 에러 메시지 제거
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
      <div className="modal-content" style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 16px rgba(0,0,0,0.2)', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
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
          {/* 기본 정보 섹션 */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>기본정보</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* 건물명 - datalist를 이용한 자동완성 */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  건물명 <span style={{ color: '#f44336' }}>*</span>
                </label>
                <input
                  type="text"
                  name="buildingName"
                  list="building-names"
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
                <datalist id="building-names">
                  {buildings.map(building => (
                    <option key={building.id} value={building.name} />
                  ))}
                </datalist>
                {errors.buildingName && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{errors.buildingName}</div>}
              </div>
              <FormField label="호실명" name="roomName" value={formData.roomName} placeholder="예: 101, 205-A" required onChange={handleChange} errors={errors} />
            </div>
          </div>

          {/* 날짜 정보 섹션 */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>날짜정보</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormField label="계약서작성일" name="contractDate" type="date" value={formData.contractDate} onChange={handleChange} errors={errors} />
              <FormField label="잔금일" name="balanceDate" type="date" value={formData.balanceDate} onChange={handleChange} errors={errors} />
            </div>
            <div style={{ marginTop: '16px' }}>
              <FormField label="만기일" name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} errors={errors} />
            </div>
          </div>

          {/* 임대인 정보 섹션 */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>임대인정보</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormField label="임대인이름" name="landlordName" value={formData.landlordName} placeholder="임대인 이름을 입력해주세요" onChange={handleChange} errors={errors} />
              <FormField label="임대인번호" name="landlordPhone" value={formData.landlordPhone} placeholder="010-0000-0000" onChange={handleChange} errors={errors} />
            </div>
          </div>

          {/* 임차인 정보 섹션 */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>임차인정보</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormField label="임차인이름" name="tenantName" value={formData.tenantName} placeholder="임차인 이름을 입력해주세요" onChange={handleChange} errors={errors} />
              <FormField label="임차인번호" name="tenantPhone" value={formData.tenantPhone} placeholder="010-0000-0000" onChange={handleChange} errors={errors} />
            </div>
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
