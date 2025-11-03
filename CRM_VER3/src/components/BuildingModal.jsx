import React, { useState, useEffect } from 'react';
import { BUILDING_LOCATIONS, BUILDING_TYPES } from '../constants';
import { generateId, formatDateTime } from '../utils/helpers';

const BuildingModal = ({ isOpen, building, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    address: '',
    approvalDate: '',
    floors: '',
    parking: '',
    units: '',
    entrance: '',
    office: '',
    location: BUILDING_LOCATIONS[0],
    type: BUILDING_TYPES[0],
    memo: '',
    createdAt: new Date().toISOString()
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (building) {
      setFormData(building);
    } else {
      setFormData({
        id: generateId(),
        name: '',
        address: '',
        approvalDate: '',
        floors: '',
        parking: '',
        units: '',
        entrance: '',
        office: '',
        location: BUILDING_LOCATIONS[0],
        type: BUILDING_TYPES[0],
        memo: '',
        createdAt: new Date().toISOString()
      });
    }
    setErrors({});
  }, [building, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = '건물명은 필수입니다';
    if (!formData.address.trim()) newErrors.address = '지번은 필수입니다';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>{building ? '건물 수정' : '건물 추가'}</h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {/* 건물명 */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px', display: 'block' }}>
                건물명 *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="건물명"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: errors.name ? '2px solid #f44336' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
              {errors.name && <span style={{ fontSize: '11px', color: '#f44336', marginTop: '3px', display: 'block' }}>{errors.name}</span>}
            </div>

            {/* 지번 */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px', display: 'block' }}>
                지번 *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="지번"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: errors.address ? '2px solid #f44336' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
              {errors.address && <span style={{ fontSize: '11px', color: '#f44336', marginTop: '3px', display: 'block' }}>{errors.address}</span>}
            </div>

            {/* 사용승인일 */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px', display: 'block' }}>
                사용승인일
              </label>
              <input
                type="date"
                name="approvalDate"
                value={formData.approvalDate}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 층수 */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px', display: 'block' }}>
                층수
              </label>
              <input
                type="number"
                name="floors"
                value={formData.floors}
                onChange={handleChange}
                placeholder="층수"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 주차대수 */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px', display: 'block' }}>
                주차대수
              </label>
              <input
                type="number"
                name="parking"
                value={formData.parking}
                onChange={handleChange}
                placeholder="주차대수"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 세대수 */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px', display: 'block' }}>
                세대수
              </label>
              <input
                type="number"
                name="units"
                value={formData.units}
                onChange={handleChange}
                placeholder="세대수"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 공동현관비번 */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px', display: 'block' }}>
                공동현관비번
              </label>
              <input
                type="text"
                name="entrance"
                value={formData.entrance}
                onChange={handleChange}
                placeholder="비번"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 관리실번호 */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px', display: 'block' }}>
                관리실번호
              </label>
              <input
                type="text"
                name="office"
                value={formData.office}
                onChange={handleChange}
                placeholder="번호"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 위치 */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px', display: 'block' }}>
                위치
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              >
                {BUILDING_LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* 유형 */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px', display: 'block' }}>
                유형
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              >
                {BUILDING_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px', display: 'block' }}>
              메모
            </label>
            <textarea
              name="memo"
              value={formData.memo}
              onChange={handleChange}
              placeholder="메모"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
                minHeight: '80px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* 버튼 */}
          <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #e0e0e0' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '10px 20px', fontSize: '14px' }}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '14px' }}
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuildingModal;
