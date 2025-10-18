import React, { useState } from 'react';
import { PROPERTY_STATUSES } from '../../constants';
import { generateId, formatDateTime } from '../../utils/helpers';
import { parsePropertyDetails } from '../../utils/textParser';

const MeetingTab = ({ customerId, customerName, meetings, onSaveMeeting, onDeleteMeeting }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [viewingMeeting, setViewingMeeting] = useState(null);

  const customerMeetings = meetings.filter(m => m.customerId === customerId);

  const MeetingForm = ({ onCancel, meetingData }) => {
    const initFormData = () => {
      if (meetingData) {
        // 수정 모드: 기존 데이터를 date와 time으로 분리
        const dateTimeStr = meetingData.date || new Date().toISOString().slice(0, 16);
        return {
          ...meetingData,
          date: dateTimeStr.slice(0, 10),
          time: meetingData.time || dateTimeStr.slice(11, 16)
        };
      }
      // 추가 모드
      return {
        date: new Date().toISOString().slice(0, 10),
        time: '12:00',
        properties: []
      };
    };

    const [formData, setFormData] = useState(initFormData());
    const [showPropertyModal, setShowPropertyModal] = useState(false);
    const [editingPropertyIndex, setEditingPropertyIndex] = useState(null);

    const handleMeetingChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    const handlePropertyChange = (index, e) => {
        const newProperties = [...formData.properties];
        newProperties[index] = {...newProperties[index], [e.target.name]: e.target.value};
        setFormData({...formData, properties: newProperties});
    }

    const addProperty = () => {
        const newProperty = { id: generateId(), roomName: '', visitTime: '', agency: '', agencyPhone: '', info: '', status: PROPERTY_STATUSES[0] };
        setFormData({...formData, properties: [...formData.properties, newProperty]});
    }

    const removeProperty = (index) => {
        if (confirm('정말 이 매물을 삭제하시겠습니까?')) {
            const newProperties = formData.properties.filter((_, i) => i !== index);
            setFormData({...formData, properties: newProperties});
        }
    }

    const handleSubmit = () => {
        const meetingToSave = {
          ...formData,
          id: formData.id || generateId(),
          customerId,
          date: `${formData.date}T${formData.time}:00`
        };
        onSaveMeeting(meetingToSave);
        setIsAdding(false);
        setEditingMeeting(null);
        onCancel();
    }

    const PropertyModal = ({ onClose, propertyToEdit, editIndex }) => {
      const [propertyData, setPropertyData] = useState(
        propertyToEdit || { roomName: '', visitTime: '', agency: '', agencyPhone: '', info: '', status: PROPERTY_STATUSES[0] }
      );

      const handleInfoChange = (e) => {
        const info = e.target.value;
        const { propertyName, agencyName, contactNumber } = parsePropertyDetails(info);

        setPropertyData({
          ...propertyData,
          info: info,
          roomName: propertyName || propertyData.roomName,
          agency: agencyName || propertyData.agency,
          agencyPhone: contactNumber || propertyData.agencyPhone
        });
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
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editIndex !== null && editIndex !== undefined ? '매물 수정' : '매물 추가'}</h3>
              <button className="btn-close" onClick={onClose}>×</button>
            </div>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>매물정보 (전체 텍스트 붙여넣기)</label>
                <textarea
                  className="large"
                  placeholder="매물 정보를 붙여넣으세요&#10;2번째 줄 → 호실명 자동입력&#10;7번째 줄 → 부동산 자동입력&#10;마지막 줄 → 연락처 자동입력"
                  value={propertyData.info}
                  onChange={handleInfoChange}
                ></textarea>
                <p className="form-hint">
                  매물 정보를 붙여넣으면 2번째 줄이 호실명, 7번째 줄이 부동산, 마지막 줄이 연락처로 자동 입력됩니다.
                </p>
              </div>
              <div className="form-group">
                <label>호실명</label>
                <input type="text" placeholder="자동 입력되지만 수정 가능합니다" value={propertyData.roomName} onChange={(e) => setPropertyData({...propertyData, roomName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>연락처</label>
                <input type="text" placeholder="자동 입력되지만 수정 가능합니다" value={propertyData.agencyPhone} onChange={(e) => setPropertyData({...propertyData, agencyPhone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>방문시간</label>
                <input type="time" value={propertyData.visitTime} onChange={(e) => setPropertyData({...propertyData, visitTime: e.target.value})} />
              </div>
              <div className="form-group">
                <label>준비상태</label>
                <select value={propertyData.status} onChange={(e) => setPropertyData({...propertyData, status: e.target.value})}>
                  {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>부동산</label>
                <input type="text" value={propertyData.agency} onChange={(e) => setPropertyData({...propertyData, agency: e.target.value})} />
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
        <div className="modal-overlay" onClick={onCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>미팅 추가 - {customerName ? customerName.slice(0, 30) : ''}</h3>
              <button className="btn-close" onClick={onCancel}>×</button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>미팅 날짜</label>
                <input type="date" name="date" value={formData.date} onChange={handleMeetingChange} />
              </div>
              <div className="form-group">
                <label>미팅 시간</label>
                <input type="time" name="time" value={formData.time} onChange={handleMeetingChange} />
              </div>
            </div>

            <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>매물 준비</h4>
            {formData.properties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                준비된 매물이 없습니다.
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
                    <span className="property-detail" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      🕐
                      <input
                        type="time"
                        value={prop.visitTime || ''}
                        onChange={(e) => {
                          const newProperties = [...formData.properties];
                          newProperties[index] = {...newProperties[index], visitTime: e.target.value};
                          setFormData({...formData, properties: newProperties});
                        }}
                        style={{
                          border: '1px solid #e0e0e0',
                          padding: '2px 5px',
                          borderRadius: '3px',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      />
                      방문
                    </span>
                  </div>
                  <div style={{ padding: '10px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={() => { setEditingPropertyIndex(index); setShowPropertyModal(true); }} className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>수정</button>
                    <button onClick={() => removeProperty(index)} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>삭제</button>
                  </div>
                </div>
              ))
            )}
            <div style={{ textAlign: 'center', margin: '20px 0', borderTop: '1px dashed #ccc', paddingTop: '20px' }}>
              <button onClick={() => { setEditingPropertyIndex(null); setShowPropertyModal(true); }} className="btn-primary">+ 매물 추가</button>
            </div>

            <div className="modal-footer">
              <button onClick={onCancel} className="btn-secondary">취소</button>
              <button onClick={handleSubmit} className="btn-primary">저장</button>
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

  const formatVisitTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? '오전' : '오후';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${period} ${displayHour}:${minutes}`;
  };

  const formatMeetingDate = (dateTime) => {
    if (!dateTime) return '';
    return dateTime.slice(0, 10);
  };

  const formatMeetingTime = (dateTime) => {
    if (!dateTime) return '';
    const time = dateTime.slice(11, 16);
    return formatVisitTime(time);
  };

  const PropertiesViewModal = ({ meeting, onClose }) => {
    const [editingPropertyIndex, setEditingPropertyIndex] = useState(null);
    const [showPropertyEditModal, setShowPropertyEditModal] = useState(false);

    // 방문시간 순으로 정렬 (원본 인덱스 보존)
    const sortedProperties = meeting.properties ? meeting.properties.map((prop, originalIndex) => ({ prop, originalIndex }))
      .sort((a, b) => {
        if (!a.prop.visitTime) return 1;
        if (!b.prop.visitTime) return -1;
        return a.prop.visitTime.localeCompare(b.prop.visitTime);
      }) : [];

    const handlePropertyEdit = (propertyIndex) => {
      setEditingPropertyIndex(propertyIndex);
      setShowPropertyEditModal(true);
    };

    const handlePropertyDelete = (propertyIndex) => {
      if (confirm('이 매물을 삭제하시겠습니까?')) {
        const updatedProperties = meeting.properties.filter((_, index) => index !== propertyIndex);
        const updatedMeeting = {
          ...meeting,
          properties: updatedProperties
        };
        onSaveMeeting(updatedMeeting);
        // viewingMeeting 상태도 업데이트
        setViewingMeeting(updatedMeeting);
      }
    };

    const handlePropertySave = (propertyData, editIndex) => {
      const newProperties = [...meeting.properties];
      if (editIndex !== null && editIndex !== undefined) {
        newProperties[editIndex] = propertyData;
      } else {
        newProperties.push({ ...propertyData, id: generateId() });
      }

      const updatedMeeting = {
        ...meeting,
        properties: newProperties
      };
      onSaveMeeting(updatedMeeting);
      // viewingMeeting 상태도 업데이트
      setViewingMeeting(updatedMeeting);
      setShowPropertyEditModal(false);
      setEditingPropertyIndex(null);
    };

    const PropertyEditModal = ({ propertyToEdit, editIndex, onClose }) => {
      const [propertyData, setPropertyData] = useState(
        propertyToEdit || { roomName: '', visitTime: '', agency: '', agencyPhone: '', info: '', status: PROPERTY_STATUSES[0] }
      );

      const handleInfoChange = (e) => {
        const info = e.target.value;
        const { propertyName, agencyName, contactNumber } = parsePropertyDetails(info);

        setPropertyData({
          ...propertyData,
          info: info,
          roomName: propertyName || propertyData.roomName,
          agency: agencyName || propertyData.agency,
          agencyPhone: contactNumber || propertyData.agencyPhone
        });
      };

      return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
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
                  placeholder="매물 정보를 붙여넣으세요&#10;2번째 줄 → 호실명 자동입력&#10;7번째 줄 → 부동산 자동입력&#10;마지막 줄 → 연락처 자동입력"
                  value={propertyData.info}
                  onChange={handleInfoChange}
                ></textarea>
                <p className="form-hint">
                  매물 정보를 붙여넣으면 2번째 줄이 호실명, 7번째 줄이 부동산, 마지막 줄이 연락처로 자동 입력됩니다.
                </p>
              </div>
              <div className="form-group">
                <label>호실명</label>
                <input type="text" placeholder="자동 입력되지만 수정 가능합니다" value={propertyData.roomName} onChange={(e) => setPropertyData({...propertyData, roomName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>연락처</label>
                <input type="text" placeholder="자동 입력되지만 수정 가능합니다" value={propertyData.agencyPhone} onChange={(e) => setPropertyData({...propertyData, agencyPhone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>방문시간</label>
                <input type="time" value={propertyData.visitTime} onChange={(e) => setPropertyData({...propertyData, visitTime: e.target.value})} />
              </div>
              <div className="form-group">
                <label>준비상태</label>
                <select value={propertyData.status} onChange={(e) => setPropertyData({...propertyData, status: e.target.value})}>
                  {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>부동산</label>
                <input type="text" value={propertyData.agency} onChange={(e) => setPropertyData({...propertyData, agency: e.target.value})} />
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

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>미팅 매물 - {formatDateTime(meeting.date)}</h3>
            <button className="btn-close" onClick={onClose}>×</button>
          </div>
          <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '10px 0' }}>
            {sortedProperties.length > 0 ? (
              sortedProperties.map(({ prop, originalIndex }) => (
                <div key={prop.id} className="property-card" style={{ marginBottom: '15px' }}>
                  <div className="property-card-header">
                    <div className="property-room-name">🏠 {prop.roomName || '미지정'}</div>
                    <select
                      className={`property-status-badge status-${prop.status}`}
                      value={prop.status}
                      onChange={(e) => {
                        const newProperties = [...meeting.properties];
                        newProperties[originalIndex] = {...newProperties[originalIndex], status: e.target.value};
                        const updatedMeeting = {...meeting, properties: newProperties};
                        onSaveMeeting(updatedMeeting);
                        setViewingMeeting(updatedMeeting);
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
                    <span className="property-detail" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      🕐
                      <input
                        type="time"
                        value={prop.visitTime || ''}
                        onChange={(e) => {
                          const newProperties = [...meeting.properties];
                          newProperties[originalIndex] = {...newProperties[originalIndex], visitTime: e.target.value};
                          const updatedMeeting = {...meeting, properties: newProperties};
                          onSaveMeeting(updatedMeeting);
                          setViewingMeeting(updatedMeeting);
                        }}
                        style={{
                          border: '1px solid #e0e0e0',
                          padding: '2px 5px',
                          borderRadius: '3px',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      />
                      방문
                    </span>
                  </div>
                  <div style={{ padding: '10px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={() => handlePropertyEdit(originalIndex)} className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>수정</button>
                    <button onClick={() => handlePropertyDelete(originalIndex)} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>삭제</button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                등록된 매물이 없습니다.
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button onClick={onClose} className="btn-primary">닫기</button>
          </div>
          {showPropertyEditModal && (
            <PropertyEditModal
              propertyToEdit={editingPropertyIndex !== null ? meeting.properties[editingPropertyIndex] : null}
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
        {!isAdding && !editingMeeting && <button onClick={() => setIsAdding(true)}>+ 미팅 추가</button>}
        {isAdding && <MeetingForm onCancel={() => setIsAdding(false)} />}

        {editingMeeting ? (
          <MeetingForm key={editingMeeting.id} meetingData={editingMeeting} onCancel={() => setEditingMeeting(null)} />
        ) : customerMeetings.length > 0 ? (
          <table className="customer-table" style={{ marginTop: '15px' }}>
            <thead>
              <tr>
                <th>미팅날짜</th>
                <th>미팅시간</th>
                <th>매물수</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {customerMeetings.map(meeting => (
                <tr key={meeting.id}>
                  <td>{formatMeetingDate(meeting.date)}</td>
                  <td>{formatMeetingTime(meeting.date)}</td>
                  <td
                    onClick={() => setViewingMeeting(meeting)}
                    style={{
                      cursor: 'pointer',
                      color: 'var(--primary-blue)',
                      textDecoration: 'underline'
                    }}
                  >
                    {meeting.properties?.length || 0}개 매물
                  </td>
                  <td>
                    <button
                      onClick={() => setEditingMeeting(meeting)}
                      style={{ fontSize: '12px', padding: '4px 8px', marginRight: '5px' }}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => onDeleteMeeting(meeting.id)}
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
            등록된 미팅이 없습니다.
          </div>
        )}

        {viewingMeeting && <PropertiesViewModal meeting={viewingMeeting} onClose={() => setViewingMeeting(null)} />}
    </div>
  );
};

export default MeetingTab;
