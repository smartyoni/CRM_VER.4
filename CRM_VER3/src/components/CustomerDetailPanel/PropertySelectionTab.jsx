import React, { useState } from 'react';
import { PROPERTY_STATUSES } from '../../constants';
import { generateId, formatDateTime } from '../../utils/helpers';
import { parsePropertyDetails, generateStructuredPropertyInfo } from '../../utils/textParser';

const PropertySelectionTab = ({ customerId, customerName, propertySelections, onSavePropertySelection, onDeletePropertySelection, onTabChange, onCreateMeetingFromSelection }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingSelection, setEditingSelection] = useState(null);
  const [viewingSelection, setViewingSelection] = useState(null);

  const customerSelections = propertySelections
    .filter(s => s.customerId === customerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const PropertySelectionForm = ({ onCancel, selectionData }) => {
    const initFormData = () => {
      if (selectionData) {
        return { ...selectionData };
      }
      return {
        properties: []
      };
    };

    const [formData, setFormData] = useState(initFormData());
    const [showPropertyModal, setShowPropertyModal] = useState(false);
    const [editingPropertyIndex, setEditingPropertyIndex] = useState(null);

    const handlePropertyChange = (index, e) => {
        const newProperties = [...formData.properties];
        newProperties[index] = {...newProperties[index], [e.target.name]: e.target.value};
        setFormData({...formData, properties: newProperties});
    }

    const addProperty = () => {
        const newProperty = { id: generateId(), roomName: '', agency: '', agencyPhone: '', info: '', status: PROPERTY_STATUSES[0] };
        setFormData({...formData, properties: [...formData.properties, newProperty]});
    }

    const removeProperty = (index) => {
        if (confirm('정말 이 매물을 삭제하시겠습니까?')) {
            const newProperties = formData.properties.filter((_, i) => i !== index);
            setFormData({...formData, properties: newProperties});
        }
    }

    const handleSubmit = () => {
        const selectionToSave = {
          ...formData,
          id: formData.id || generateId(),
          customerId,
          createdAt: formData.createdAt || new Date().toISOString()
        };
        onSavePropertySelection(selectionToSave);
        setIsAdding(false);
        setEditingSelection(null);
        onCancel();
    }

    const handleCreateMeeting = () => {
      if (formData.properties.length === 0) {
        alert('매물을 먼저 추가해주세요.');
        return;
      }

      // 매물선정 저장
      const selectionToSave = {
        ...formData,
        id: formData.id || generateId(),
        customerId,
        createdAt: formData.createdAt || new Date().toISOString()
      };
      onSavePropertySelection(selectionToSave);

      // 미팅 생성 모드로 전환
      onCreateMeetingFromSelection(formData.properties);
      setIsAdding(false);
      setEditingSelection(null);
      onCancel(); // 현재 폼 닫기
    };


    const PropertyModal = ({ onClose, propertyToEdit, editIndex }) => {
      const [propertyData, setPropertyData] = useState(
        propertyToEdit || { roomName: '', agency: '', agencyPhone: '', info: '', status: PROPERTY_STATUSES[0] }
      );
      const [source, setSource] = useState('TEN');

      const handleInfoChange = (e) => {
        const info = e.target.value;

        setPropertyData({
          ...propertyData,
          info: info
        });
      };

      const handleGenerateStructuredInfo = () => {
        const rawInfo = propertyData.info;

        // 1. 원본 → 정리본 변환
        const structuredInfo = generateStructuredPropertyInfo(rawInfo);

        if (!structuredInfo) {
          alert('매물정보에서 필요한 데이터를 추출할 수 없습니다. 정보를 확인해주세요.');
          return;
        }

        // 2. textarea에 정리본 표시
        const updatedData = {
          ...propertyData,
          info: structuredInfo
        };

        // 3. 정리본에서 호실명, 부동산, 연락처 자동 추출
        const { propertyName, agencyName, contactNumber } = parsePropertyDetails(structuredInfo);

        updatedData.roomName = propertyName || propertyData.roomName;
        updatedData.agency = agencyName || propertyData.agency;
        updatedData.agencyPhone = contactNumber || propertyData.agencyPhone;

        setPropertyData(updatedData);
      };

      const handlePropertySave = () => {
        if (editIndex !== null && editIndex !== undefined) {
          // 수정 모드
          const newProperties = [...formData.properties];
          newProperties[editIndex] = { ...propertyData };
          setFormData({...formData, properties: newProperties});
        } else {
          // 추가 모드
          setFormData({...formData, properties: [...formData.properties, { ...propertyData, id: generateId() }]});
        }
        onClose();
      };

      return (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editIndex !== null && editIndex !== undefined ? '매물 수정' : '매물 추가'}</h3>
              <button className="btn-close" onClick={onClose}>×</button>
            </div>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ margin: 0 }}>매물정보 (전체 텍스트 붙여넣기)</label>

                  {/* 세그먼티드 컨트롤 */}
                  <div style={{
                    display: 'flex',
                    gap: '0',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '6px',
                    padding: '2px'
                  }}>
                    <button
                      onClick={() => setSource('TEN')}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: source === 'TEN' ? '#2196F3' : 'transparent',
                        color: source === 'TEN' ? 'white' : '#666',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (source !== 'TEN') {
                          e.target.style.backgroundColor = '#e0e0e0';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (source !== 'TEN') {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      TEN
                    </button>
                    <button
                      onClick={() => setSource('네이버부동산')}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: source === '네이버부동산' ? '#2196F3' : 'transparent',
                        color: source === '네이버부동산' ? 'white' : '#666',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (source !== '네이버부동산') {
                          e.target.style.backgroundColor = '#e0e0e0';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (source !== '네이버부동산') {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      네이버부동산
                    </button>
                  </div>
                </div>
                <textarea
                  className="large"
                  placeholder="원본 매물정보를 붙여넣으세요&#10;아래 '⚡ 매물정보 자동 생성' 버튼을 클릭하면&#10;호실명, 부동산, 연락처가 자동으로 입력됩니다"
                  value={propertyData.info}
                  onChange={handleInfoChange}
                ></textarea>
                <button
                  type="button"
                  onClick={handleGenerateStructuredInfo}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px',
                    transition: 'all 0.2s',
                    display: 'block'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#F57C00'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#FF9800'}
                >
                  ⚡ 매물정보 자동 생성
                </button>
                <p className="form-hint">
                  {source === 'TEN'
                    ? '매물 정보를 붙여넣으면 2번째 줄이 호실명, 7번째 줄이 부동산, 마지막 줄이 연락처로 자동 입력됩니다.'
                    : '매물 정보를 붙여넣으면 첫 줄이 호실명, 중개사 섹션의 부동산명, 전화 라벨 뒤의 연락처가 자동 입력됩니다.'}
                </p>
              </div>
              <div className="form-group">
                <label>호실명</label>
                <input type="text" placeholder="자동 입력되지만 수정 가능합니다" value={propertyData.roomName} onChange={(e) => setPropertyData({...propertyData, roomName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>준비상태</label>
                <select value={propertyData.status} onChange={(e) => setPropertyData({...propertyData, status: e.target.value})}>
                  {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>부동산</label>
                <input type="text" value={propertyData.agency} onChange={(e) => setPropertyData({...propertyData, agency: e.target.value})} />
              </div>
              <div className="form-group">
                <label>연락처</label>
                <input type="text" placeholder="자동 입력되지만 수정 가능합니다" value={propertyData.agencyPhone} onChange={(e) => setPropertyData({...propertyData, agencyPhone: e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={onClose} className="btn-secondary">취소</button>
              <button onClick={handlePropertySave} className="btn-primary">{editIndex !== null && editIndex !== undefined ? '수정' : '추가'}</button>
            </div>
          </div>
        </div>
      );
    };

    return (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>매물선정 - {customerName ? customerName.slice(0, 30) : ''}</h3>
              <button className="btn-close" onClick={onCancel}>×</button>
            </div>

            <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>선정 매물</h4>
            {formData.properties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                선정된 매물이 없습니다.
              </div>
            ) : (
              formData.properties.map((prop, index) => (
                <div key={prop.id || index} className="property-card" style={{ marginBottom: '10px' }}>
                  <div className="property-card-header">
                    <div className="property-room-name">🏠 {prop.roomName || '미지정'}</div>
                    <select
                      className={`property-status-badge status-${prop.status}`}
                      value={prop.status}
                      onChange={(e) => {
                        const newProperties = [...formData.properties];
                        newProperties[index] = {...newProperties[index], status: e.target.value};
                        setFormData({...formData, properties: newProperties});
                      }}
                      style={{ cursor: 'pointer', border: 'none', fontWeight: 'bold' }}
                    >
                      {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="property-card-body">
                    <div className="property-info-label">📋 매물정보</div>
                    <div className="property-info-content">{prop.info}</div>
                  </div>
                  <div className="property-card-footer">
                    <span className="property-detail">🏢 {prop.agency}</span>
                    <span className="property-detail">
                      📞 {prop.agencyPhone ? <a href={`sms:${prop.agencyPhone}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{prop.agencyPhone}</a> : ''}
                    </span>
                  </div>
                  <div style={{ padding: '10px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={() => { setEditingPropertyIndex(index); setShowPropertyModal(true); }} className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>수정</button>
                    <button onClick={() => removeProperty(index)} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>삭제</button>
                  </div>
                </div>
              ))
            )}

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '20px', borderTop: '1px solid #e0e0e0', paddingTop: '15px' }}>
              <button onClick={onCancel} className="btn-secondary">취소</button>
              <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                <button
                  onClick={() => { setEditingPropertyIndex(null); setShowPropertyModal(true); }}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1976D2'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#2196F3'}
                >
                  + 매물 추가
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn-primary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  저장
                </button>
              </div>
            </div>

            {showPropertyModal && (
              <PropertyModal
                onClose={() => { setShowPropertyModal(false); setEditingPropertyIndex(null); }}
                propertyToEdit={editingPropertyIndex !== null ? formData.properties[editingPropertyIndex] : null}
                editIndex={editingPropertyIndex}
              />
            )}
          </div>
        </div>
    )
  }

  const formatCreatedDate = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const PropertiesViewModal = ({ selection, onClose }) => {
    const [editingPropertyIndex, setEditingPropertyIndex] = useState(null);
    const [showPropertyEditModal, setShowPropertyEditModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const generateReport = (properties) => {
      return properties.map(prop => {
        const lines = prop.info.split('\n').filter(line => line.trim());
        // 7번째 줄(부동산)과 마지막 줄(연락처) 제거
        if (lines.length > 1) {
          // 7번째 줄 제거 (index 6)
          if (lines.length > 6) {
            lines.splice(6, 1);
          }
          // 마지막 줄 제거
          if (lines.length > 0) {
            lines.pop();
          }
        }
        return lines.join('\n');
      }).join('\n\n');
    };

    const handleCreateMeeting = () => {
      if (selection.properties.length === 0) {
        alert('매물을 먼저 추가해주세요.');
        return;
      }

      // 매물선정은 이미 저장됨
      // 미팅 생성 모드로 전환
      onCreateMeetingFromSelection(selection.properties);
      onClose(); // 현재 모달 닫기
    };

    const handlePropertyEdit = (propertyIndex) => {
      setEditingPropertyIndex(propertyIndex);
      setShowPropertyEditModal(true);
    };

    const handlePropertyDelete = (propertyIndex) => {
      if (confirm('이 매물을 삭제하시겠습니까?')) {
        const updatedProperties = selection.properties.filter((_, index) => index !== propertyIndex);
        const updatedSelection = {
          ...selection,
          properties: updatedProperties
        };
        onSavePropertySelection(updatedSelection);
        setViewingSelection(updatedSelection);
      }
    };

    const handlePropertySave = (propertyData, editIndex) => {
      const newProperties = [...selection.properties];
      if (editIndex !== null && editIndex !== undefined) {
        newProperties[editIndex] = propertyData;
      } else {
        newProperties.push({ ...propertyData, id: generateId() });
      }

      const updatedSelection = {
        ...selection,
        properties: newProperties
      };
      onSavePropertySelection(updatedSelection);
      setViewingSelection(updatedSelection);
      setShowPropertyEditModal(false);
      setEditingPropertyIndex(null);
    };

    const PropertyEditModal = ({ propertyToEdit, editIndex, onClose }) => {
      const [propertyData, setPropertyData] = useState(
        propertyToEdit || { roomName: '', agency: '', agencyPhone: '', info: '', status: PROPERTY_STATUSES[0] }
      );
      const [source, setSource] = useState('TEN');

      const handleInfoChange = (e) => {
        const info = e.target.value;

        setPropertyData({
          ...propertyData,
          info: info
        });
      };

      const handleGenerateStructuredInfo = () => {
        const rawInfo = propertyData.info;

        // 1. 원본 → 정리본 변환
        const structuredInfo = generateStructuredPropertyInfo(rawInfo);

        if (!structuredInfo) {
          alert('매물정보에서 필요한 데이터를 추출할 수 없습니다. 정보를 확인해주세요.');
          return;
        }

        // 2. textarea에 정리본 표시
        const updatedData = {
          ...propertyData,
          info: structuredInfo
        };

        // 3. 정리본에서 호실명, 부동산, 연락처 자동 추출
        const { propertyName, agencyName, contactNumber } = parsePropertyDetails(structuredInfo);

        updatedData.roomName = propertyName || propertyData.roomName;
        updatedData.agency = agencyName || propertyData.agency;
        updatedData.agencyPhone = contactNumber || propertyData.agencyPhone;

        setPropertyData(updatedData);
      };

      return (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>매물 수정</h3>
              <button className="btn-close" onClick={onClose}>×</button>
            </div>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>매물정보 (전체 텍스트 붙여넣기)</label>
                <textarea
                  className="large"
                  placeholder="원본 매물정보를 붙여넣으세요&#10;아래 '⚡ 매물정보 자동 생성' 버튼을 클릭하면&#10;호실명, 부동산, 연락처가 자동으로 입력됩니다"
                  value={propertyData.info}
                  onChange={handleInfoChange}
                ></textarea>
                <button
                  type="button"
                  onClick={handleGenerateStructuredInfo}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px',
                    transition: 'all 0.2s',
                    display: 'block'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#F57C00'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#FF9800'}
                >
                  ⚡ 매물정보 자동 생성
                </button>
                <p className="form-hint">
                  원본 매물정보를 붙여넣고 아래 '⚡ 매물정보 자동 생성' 버튼을 클릭하면 호실명, 부동산, 연락처가 자동으로 입력됩니다.
                </p>
              </div>
              <div className="form-group">
                <label>호실명</label>
                <input type="text" placeholder="자동 입력되지만 수정 가능합니다" value={propertyData.roomName} onChange={(e) => setPropertyData({...propertyData, roomName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>준비상태</label>
                <select value={propertyData.status} onChange={(e) => setPropertyData({...propertyData, status: e.target.value})}>
                  {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>부동산</label>
                <input type="text" value={propertyData.agency} onChange={(e) => setPropertyData({...propertyData, agency: e.target.value})} />
              </div>
              <div className="form-group">
                <label>연락처</label>
                <input type="text" placeholder="자동 입력되지만 수정 가능합니다" value={propertyData.agencyPhone} onChange={(e) => setPropertyData({...propertyData, agencyPhone: e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={onClose} className="btn-secondary">취소</button>
              <button onClick={() => handlePropertySave(propertyData, editIndex)} className="btn-primary">수정</button>
            </div>
          </div>
        </div>
      );
    };

    const ReportModal = ({ onClose }) => {
      const [reportText, setReportText] = useState(generateReport(selection.properties));
      const [isEditing, setIsEditing] = useState(false);

      const handleCopy = async () => {
        try {
          await navigator.clipboard.writeText(reportText);
          alert('보고서가 클립보드에 복사되었습니다!');
        } catch (err) {
          alert('복사에 실패했습니다: ' + err.message);
        }
      };

      return (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>매물 브리핑 보고서</h3>
              <button className="btn-close" onClick={onClose}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              {isEditing ? (
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '400px',
                    padding: '12px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                />
              ) : (
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  backgroundColor: '#f5f5f5',
                  padding: '15px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  border: '1px solid #e0e0e0'
                }}>
                  {reportText}
                </pre>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={onClose} className="btn-secondary">닫기</button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-primary"
                style={{ marginLeft: '10px' }}
              >
                {isEditing ? '완료' : '수정'}
              </button>
              <button
                onClick={handleCopy}
                className="btn-primary"
                style={{ marginLeft: '10px' }}
              >
                복사
              </button>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>선정 매물 - {formatCreatedDate(selection.createdAt)}</h3>
            <button className="btn-close" onClick={onClose}>×</button>
          </div>
          <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '10px 0' }}>
            {selection.properties && selection.properties.length > 0 ? (
              selection.properties.map((prop, index) => (
                <div key={prop.id} className="property-card" style={{ marginBottom: '15px' }}>
                  <div className="property-card-header">
                    <div className="property-room-name">🏠 {prop.roomName || '미지정'}</div>
                    <select
                      className={`property-status-badge status-${prop.status}`}
                      value={prop.status}
                      onChange={(e) => {
                        const newProperties = [...selection.properties];
                        newProperties[index] = {...newProperties[index], status: e.target.value};
                        const updatedSelection = {...selection, properties: newProperties};
                        onSavePropertySelection(updatedSelection);
                        setViewingSelection(updatedSelection);
                      }}
                      style={{ cursor: 'pointer', border: 'none', fontWeight: 'bold' }}
                    >
                      {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="property-card-body">
                    <div className="property-info-label">📋 매물정보</div>
                    <div className="property-info-content">{prop.info}</div>
                  </div>
                  <div className="property-card-footer">
                    <span className="property-detail">🏢 {prop.agency}</span>
                    <span className="property-detail">
                      📞 {prop.agencyPhone ? <a href={`sms:${prop.agencyPhone}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{prop.agencyPhone}</a> : ''}
                    </span>
                  </div>
                  <div style={{ padding: '10px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={() => handlePropertyEdit(index)} className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>수정</button>
                    <button onClick={() => handlePropertyDelete(index)} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>삭제</button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                등록된 매물이 없습니다.
              </div>
            )}
          </div>
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={onClose} className="btn-primary">닫기</button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowReportModal(true)}
                disabled={!selection.properties || selection.properties.length === 0}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (!selection.properties || selection.properties.length === 0) ? 'not-allowed' : 'pointer',
                  opacity: (!selection.properties || selection.properties.length === 0) ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selection.properties && selection.properties.length > 0) {
                    e.target.style.backgroundColor = '#d32f2f';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selection.properties && selection.properties.length > 0) {
                    e.target.style.backgroundColor = '#f44336';
                  }
                }}
              >
                📋 보고서 생성
              </button>
              <button
                onClick={handleCreateMeeting}
                disabled={!selection.properties || selection.properties.length === 0}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backgroundColor: '#9C27B0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (!selection.properties || selection.properties.length === 0) ? 'not-allowed' : 'pointer',
                  opacity: (!selection.properties || selection.properties.length === 0) ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selection.properties && selection.properties.length > 0) {
                    e.target.style.backgroundColor = '#7B1FA2';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selection.properties && selection.properties.length > 0) {
                    e.target.style.backgroundColor = '#9C27B0';
                  }
                }}
              >
                📅 미팅내역추가
              </button>
            </div>
          </div>
          {showReportModal && (
            <ReportModal onClose={() => setShowReportModal(false)} />
          )}
          {showPropertyEditModal && (
            <PropertyEditModal
              propertyToEdit={editingPropertyIndex !== null ? selection.properties[editingPropertyIndex] : null}
              editIndex={editingPropertyIndex}
              onClose={() => { setShowPropertyEditModal(false); setEditingPropertyIndex(null); }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="meeting-tab">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          {!isAdding && !editingSelection && (
            <button
              onClick={() => setIsAdding(true)}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              + 매물선정
            </button>
          )}
        </div>
        {isAdding && <PropertySelectionForm onCancel={() => setIsAdding(false)} />}

        {editingSelection ? (
          <PropertySelectionForm key={editingSelection.id} selectionData={editingSelection} onCancel={() => setEditingSelection(null)} />
        ) : customerSelections.length > 0 ? (
          <table className="customer-table">
            <thead>
              <tr>
                <th>생성일자</th>
                <th>매물수</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {customerSelections.map(selection => (
                <tr key={selection.id}>
                  <td>{formatCreatedDate(selection.createdAt)}</td>
                  <td
                    onClick={() => setViewingSelection(selection)}
                    style={{
                      cursor: 'pointer',
                      color: 'var(--primary-blue)',
                      textDecoration: 'underline'
                    }}
                  >
                    {selection.properties?.length || 0}개 매물
                  </td>
                  <td>
                    <button
                      onClick={() => setEditingSelection(selection)}
                      style={{ fontSize: '12px', padding: '4px 8px', marginRight: '5px' }}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => onDeletePropertySelection(selection.id)}
                      className="btn-secondary"
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            등록된 매물선정이 없습니다.
          </div>
        )}

        {viewingSelection && <PropertiesViewModal selection={viewingSelection} onClose={() => setViewingSelection(null)} />}
    </div>
  );
};

export default PropertySelectionTab;
