import React, { useState, useEffect } from 'react';
import { PROPERTY_STATUSES } from '../../constants';
import { generateId, formatDateTime } from '../../utils/helpers';
import { parsePropertyDetails } from '../../utils/textParser';

const MeetingTab = ({ customerId, customerName, meetings, onSaveMeeting, onDeleteMeeting, initialProperties, onClearInitialProperties }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [viewingMeeting, setViewingMeeting] = useState(null);
  const [initialPropertiesData, setInitialPropertiesData] = useState(null);

  // initialProperties가 있으면 자동으로 폼 열기
  useEffect(() => {
    if (initialProperties && initialProperties.length > 0) {
      setInitialPropertiesData(initialProperties);
      setIsAdding(true);
      // 클리어
      if (onClearInitialProperties) {
        onClearInitialProperties();
      }
    }
  }, [initialProperties, onClearInitialProperties]);

  // 오늘 날짜 확인 함수
  const isToday = (dateString) => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const meetingDate = dateString.slice(0, 10);
    return meetingDate === todayStr;
  };

  const customerMeetings = meetings
    .filter(m => m.customerId === customerId);

  const MeetingForm = ({ onCancel, meetingData, initialPropertiesData }) => {
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
        properties: initialPropertiesData || []
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
        const newProperty = { id: generateId(), roomName: '', visitTime: '', agency: '', agencyPhone: '', info: '', customerResponse: '', photos: ['', ''], status: PROPERTY_STATUSES[0] };
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
        propertyToEdit || { roomName: '', visitTime: '', agency: '', agencyPhone: '', info: '', customerResponse: '', photos: ['', ''], status: PROPERTY_STATUSES[0] }
      );
      const [source, setSource] = useState('TEN');

      const handleInfoChange = (e) => {
        const info = e.target.value;
        const { propertyName, agencyName, contactNumber } = parsePropertyDetails(info, source);

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
                  placeholder="매물 정보를 붙여넣으세요&#10;2번째 줄 → 호실명 자동입력&#10;7번째 줄 → 부동산 자동입력&#10;마지막 줄 → 연락처 자동입력"
                  value={propertyData.info}
                  onChange={handleInfoChange}
                ></textarea>
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
        <div className="modal-overlay">
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

  // 미팅일시 통합 포맷: "10월22일 13시 (3개)"
  const formatMeetingDateTime = (dateTime, propertyCount) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    return `${month}월${day}일 ${hours}시 (${propertyCount}개)`;
  };

  // 건물명 추출 (주소 및 지번 제외, 최대 5글자, 나머지는 ...)
  const extractBuildingName = (roomName) => {
    if (!roomName) return '';

    let text = roomName.trim();

    // 1단계: 이모지 및 특수문자 제거
    text = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim(); // 이모지 제거
    text = text.replace(/[→↓↑←]/g, '').trim(); // 화살표 제거
    text = text.replace(/[^\w\s가-힣()]/g, '').trim(); // 특수문자 제거

    // 2단계: 괄호 안의 모든 내용 제거 (주소 정보)
    const beforeParen = text.split('(')[0].trim();

    // 3단계: 모든 주소 요소 제거
    let cleanText = beforeParen;

    // 시도 제거 (서울시, 부산시 등)
    cleanText = cleanText.replace(/서울시|부산시|대구시|인천시|광주시|대전시|울산시|세종시|경기도|강원도|충청북도|충청남도|전라북도|전라남도|경상북도|경상남도|제주도/g, '').trim();

    // 구 제거 (강남구, 강서구 등 - 앞에 한글이 있고 뒤에 구가 붙는 형태)
    cleanText = cleanText.replace(/[가-힣]+[구]/g, '').trim();

    // 동/로/길 제거 (앞에 한글이 있고 끝이 동/로/길인 형태)
    cleanText = cleanText.replace(/[가-힣]+[동로길]/g, '').trim();

    // 지번 패턴 제거 (예: 123-45, 123, 456-7 등)
    cleanText = cleanText.replace(/\b\d+(-\d+)?\b/g, '').trim();

    // 4단계: 불필요한 공백 정리
    cleanText = cleanText.replace(/\s+/g, ' ').trim();

    // 5단계: 빈 문자열인 경우 '-' 반환
    if (!cleanText) return '-';

    // 6단계: 5글자 초과시 "..." 추가
    if (cleanText.length > 5) {
      return cleanText.substring(0, 5) + '...';
    }

    return cleanText;
  };

  // 매물명 리스트 생성 (쉼표로 구분)
  const formatPropertyNames = (properties) => {
    if (!properties || properties.length === 0) return '-';
    const names = properties.map(prop => extractBuildingName(prop.roomName)).filter(name => name);
    return names.join(', ') || '-';
  };

  // 우클릭 컨텍스트 메뉴 상태
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuMeeting, setContextMenuMeeting] = useState(null);

  const handleContextMenu = (e, meeting) => {
    e.preventDefault();
    setContextMenuMeeting(meeting);
    setContextMenu({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
    setContextMenuMeeting(null);
  };

  const PropertiesViewModal = ({ meeting, onClose }) => {
    const [editingPropertyIndex, setEditingPropertyIndex] = useState(null);
    const [showPropertyEditModal, setShowPropertyEditModal] = useState(false);
    const [editingInfoIndex, setEditingInfoIndex] = useState(null);
    const [editingInfoValue, setEditingInfoValue] = useState('');
    const [editingResponseIndex, setEditingResponseIndex] = useState(null);
    const [editingResponseValue, setEditingResponseValue] = useState('');
    const [photoSourcePropertyIndex, setPhotoSourcePropertyIndex] = useState(null);
    const fileInputRefs = React.useRef({});

    // 파일 입력 ref 저장 (안정적인 방식)
    const setFileInputRef = (key, el) => {
      if (el) {
        fileInputRefs.current[key] = el;
      }
    };

    // 방문시간 순으로 정렬 (원본 인덱스 보존)
    // photos 필드 초기화
    const normalizedProperties = meeting.properties?.map(prop => ({
      ...prop,
      photos: prop.photos || ['', '']
    })) || [];

    const sortedProperties = normalizedProperties.map((prop, originalIndex) => ({ prop, originalIndex }))
      .sort((a, b) => {
        if (!a.prop.visitTime) return 1;
        if (!b.prop.visitTime) return -1;
        return a.prop.visitTime.localeCompare(b.prop.visitTime);
      });

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

    const handleInfoDoubleClick = (originalIndex) => {
      setEditingInfoIndex(originalIndex);
      setEditingInfoValue(meeting.properties[originalIndex].info || '');
    };

    const handleInfoSave = (originalIndex) => {
      if (editingInfoIndex === originalIndex) {
        const newProperties = [...meeting.properties];
        newProperties[originalIndex] = { ...newProperties[originalIndex], info: editingInfoValue };
        const updatedMeeting = { ...meeting, properties: newProperties };
        onSaveMeeting(updatedMeeting);
        setViewingMeeting(updatedMeeting);
        setEditingInfoIndex(null);
        setEditingInfoValue('');
      }
    };

    const handleInfoCancel = () => {
      setEditingInfoIndex(null);
      setEditingInfoValue('');
    };

    const handleInfoKeyDown = (e, originalIndex) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        handleInfoSave(originalIndex);
      } else if (e.key === 'Escape') {
        handleInfoCancel();
      }
    };

    const handleResponseDoubleClick = (originalIndex) => {
      setEditingResponseIndex(originalIndex);
      setEditingResponseValue(meeting.properties[originalIndex].customerResponse || '');
    };

    const handleResponseSave = (originalIndex) => {
      if (editingResponseIndex === originalIndex) {
        const newProperties = [...meeting.properties];
        newProperties[originalIndex] = { ...newProperties[originalIndex], customerResponse: editingResponseValue };
        const updatedMeeting = { ...meeting, properties: newProperties };
        onSaveMeeting(updatedMeeting);
        setViewingMeeting(updatedMeeting);
        setEditingResponseIndex(null);
        setEditingResponseValue('');
      }
    };

    const handleResponseCancel = () => {
      setEditingResponseIndex(null);
      setEditingResponseValue('');
    };

    const handleResponseKeyDown = (e, originalIndex) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        handleResponseSave(originalIndex);
      } else if (e.key === 'Escape') {
        handleResponseCancel();
      }
    };

    const handlePhotoUpload = (e, originalIndex, photoIndex) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result;
        const newProperties = [...meeting.properties];
        const photos = newProperties[originalIndex].photos || ['', ''];
        photos[photoIndex] = base64String;
        newProperties[originalIndex] = { ...newProperties[originalIndex], photos };
        const updatedMeeting = { ...meeting, properties: newProperties };
        onSaveMeeting(updatedMeeting);
        setViewingMeeting(updatedMeeting);
      };
      reader.readAsDataURL(file);
    };

    const handlePhotoDelete = (originalIndex, photoIndex) => {
      const newProperties = [...meeting.properties];
      const photos = newProperties[originalIndex].photos || ['', ''];
      photos[photoIndex] = '';
      newProperties[originalIndex] = { ...newProperties[originalIndex], photos };
      const updatedMeeting = { ...meeting, properties: newProperties };
      onSaveMeeting(updatedMeeting);
      setViewingMeeting(updatedMeeting);
    };

    const triggerPhotoUpload = (originalIndex) => {
      const property = meeting.properties[originalIndex];
      const photos = property?.photos || ['', ''];
      const emptyPhotoIndex = photos.findIndex(p => !p);

      if (emptyPhotoIndex !== -1) {
        setPhotoSourcePropertyIndex(originalIndex);
      } else {
        alert('최대 2장까지만 첨부할 수 있습니다.');
      }
    };

    const handlePhotoSourceSelect = (source) => {
      if (photoSourcePropertyIndex === null) return;

      const property = meeting.properties[photoSourcePropertyIndex];
      const photos = property?.photos || ['', ''];
      const emptyPhotoIndex = photos.findIndex(p => !p);

      if (source === 'camera') {
        const key = `photo-camera-${photoSourcePropertyIndex}-${emptyPhotoIndex}`;
        fileInputRefs.current[key]?.click();
      } else if (source === 'file') {
        const key = `photo-file-${photoSourcePropertyIndex}-${emptyPhotoIndex}`;
        fileInputRefs.current[key]?.click();
      }

      setPhotoSourcePropertyIndex(null);
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
        propertyToEdit || { roomName: '', visitTime: '', agency: '', agencyPhone: '', info: '', customerResponse: '', photos: ['', ''], status: PROPERTY_STATUSES[0] }
      );
      const [source, setSource] = useState('TEN');

      const handleInfoChange = (e) => {
        const info = e.target.value;
        const { propertyName, agencyName, contactNumber } = parsePropertyDetails(info, source);

        setPropertyData({
          ...propertyData,
          info: info,
          roomName: propertyName || propertyData.roomName,
          agency: agencyName || propertyData.agency,
          agencyPhone: contactNumber || propertyData.agencyPhone
        });
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
                  placeholder="매물 정보를 붙여넣으세요&#10;2번째 줄 → 호실명 자동입력&#10;7번째 줄 → 부동산 자동입력&#10;마지막 줄 → 연락처 자동입력"
                  value={propertyData.info}
                  onChange={handleInfoChange}
                ></textarea>
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
      <div className="modal-overlay">
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
                    {editingInfoIndex === originalIndex ? (
                      <div style={{ padding: '8px', backgroundColor: '#fff8f0', borderRadius: '4px', border: '1px solid #FF6B9D' }}>
                        <textarea
                          value={editingInfoValue}
                          onChange={(e) => setEditingInfoValue(e.target.value)}
                          onKeyDown={(e) => handleInfoKeyDown(e, originalIndex)}
                          onBlur={() => handleInfoSave(originalIndex)}
                          autoFocus
                          style={{
                            width: '100%',
                            minHeight: '200px',
                            padding: '8px',
                            border: '1px solid #FF6B9D',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleInfoSave(originalIndex)}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ✓ 저장
                          </button>
                          <button
                            onClick={handleInfoCancel}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#999',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ✕ 취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="property-info-content"
                        onDoubleClick={() => handleInfoDoubleClick(originalIndex)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#f9f9f9',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          border: '1px solid transparent',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f0f0';
                          e.currentTarget.style.border = '1px solid #e0e0e0';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9f9f9';
                          e.currentTarget.style.border = '1px solid transparent';
                        }}
                      >
                        {prop.info || '(비어있음)'}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '10px 0', borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>💬 고객반응</div>
                    {editingResponseIndex === originalIndex ? (
                      <div style={{ padding: '8px', backgroundColor: '#fff8f0', borderRadius: '4px', border: '1px solid #FF6B9D' }}>
                        <textarea
                          value={editingResponseValue}
                          onChange={(e) => setEditingResponseValue(e.target.value)}
                          onKeyDown={(e) => handleResponseKeyDown(e, originalIndex)}
                          onBlur={() => handleResponseSave(originalIndex)}
                          autoFocus
                          style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '8px',
                            border: '1px solid #FF6B9D',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleResponseSave(originalIndex)}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ✓ 저장
                          </button>
                          <button
                            onClick={handleResponseCancel}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#999',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ✕ 취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDoubleClick={() => handleResponseDoubleClick(originalIndex)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#f9f9f9',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          border: '1px solid transparent',
                          transition: 'all 0.2s ease',
                          minHeight: '20px',
                          fontSize: '13px',
                          color: '#333',
                          lineHeight: '1.5',
                          whiteSpace: 'pre-wrap'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f0f0';
                          e.currentTarget.style.border = '1px solid #e0e0e0';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9f9f9';
                          e.currentTarget.style.border = '1px solid transparent';
                        }}
                      >
                        {prop.customerResponse || '(클릭하여 고객반응 추가)'}
                      </div>
                    )}
                  </div>
                  {prop.photos && prop.photos.some(photo => photo) && (
                    <div style={{ padding: '10px 0', borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>📷 사진</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {prop.photos.map((photo, idx) => (
                          <div key={idx} style={{ position: 'relative' }}>
                            {photo ? (
                              <>
                                <img src={photo} alt={`사진 ${idx + 1}`} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px' }} />
                                <button
                                  onClick={() => handlePhotoDelete(originalIndex, idx)}
                                  style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  ✕
                                </button>
                              </>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                  <div style={{ padding: '10px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button
                      onClick={() => triggerPhotoUpload(originalIndex)}
                      style={{
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="사진 촬영/첨부"
                    >
                      📸 사진
                    </button>
                    {prop.photos && prop.photos.map((photo, idx) => (
                      <React.Fragment key={`photo-inputs-${originalIndex}-${idx}`}>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          ref={(el) => setFileInputRef(`photo-camera-${originalIndex}-${idx}`, el)}
                          onChange={(e) => handlePhotoUpload(e, originalIndex, idx)}
                          style={{ display: 'none' }}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          ref={(el) => setFileInputRef(`photo-file-${originalIndex}-${idx}`, el)}
                          onChange={(e) => handlePhotoUpload(e, originalIndex, idx)}
                          style={{ display: 'none' }}
                        />
                      </React.Fragment>
                    ))}
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

          {/* 사진 촬영/파일 선택 모달 */}
          {photoSourcePropertyIndex !== null && (
            <div className="modal-overlay" style={{ zIndex: 1200 }}>
              <div className="modal-content" style={{ width: '300px', padding: '20px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', textAlign: 'center' }}>사진 추가</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={() => handlePhotoSourceSelect('camera')}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1976D2'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2196F3'}
                  >
                    📷 카메라로 촬영
                  </button>
                  <button
                    onClick={() => handlePhotoSourceSelect('file')}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
                  >
                    📁 파일 선택
                  </button>
                  <button
                    onClick={() => setPhotoSourcePropertyIndex(null)}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#999',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#777'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#999'}
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="meeting-tab">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          {!isAdding && !editingMeeting && (
            <button
              onClick={() => setIsAdding(true)}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              + 미팅 추가
            </button>
          )}
        </div>
        {isAdding && <MeetingForm
          onCancel={() => {
            setIsAdding(false);
            setInitialPropertiesData(null);
          }}
          initialPropertiesData={initialPropertiesData}
        />}

        {editingMeeting ? (
          <MeetingForm key={editingMeeting.id} meetingData={editingMeeting} onCancel={() => setEditingMeeting(null)} />
        ) : customerMeetings.length > 0 ? (
          <>
            <table className="customer-table">
              <thead>
                <tr>
                  <th>미팅일시</th>
                  <th>매물명</th>
                </tr>
              </thead>
              <tbody>
                {customerMeetings.map(meeting => {
                  const isTodayMeeting = isToday(meeting.date);
                  return (
                    <tr
                      key={meeting.id}
                      style={{
                        backgroundColor: isTodayMeeting ? 'rgba(211, 47, 47, 0.08)' : 'transparent',
                        color: isTodayMeeting ? '#d32f2f' : 'inherit',
                        fontWeight: isTodayMeeting ? 'bold' : 'normal',
                        cursor: 'context-menu'
                      }}
                      onContextMenu={(e) => handleContextMenu(e, meeting)}
                    >
                      <td style={{ color: isTodayMeeting ? '#d32f2f' : 'inherit' }}>
                        {formatMeetingDateTime(meeting.date, meeting.properties?.length || 0)}
                      </td>
                      <td
                        onClick={() => setViewingMeeting(meeting)}
                        style={{
                          cursor: 'pointer',
                          color: isTodayMeeting ? '#d32f2f' : 'var(--primary-blue)',
                          textDecoration: 'underline',
                          fontWeight: isTodayMeeting ? 'bold' : 'normal'
                        }}
                      >
                        {formatPropertyNames(meeting.properties)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* 우클릭 컨텍스트 메뉴 */}
            {contextMenu && contextMenuMeeting && (
              <div
                className="context-menu"
                style={{
                  position: 'fixed',
                  top: contextMenu.y,
                  left: contextMenu.x,
                  zIndex: 1000
                }}
              >
                <button
                  className="context-menu-item"
                  onClick={() => {
                    setEditingMeeting(contextMenuMeeting);
                    handleContextMenuClose();
                  }}
                >
                  수정
                </button>
                <button
                  className="context-menu-item delete"
                  onClick={() => {
                    onDeleteMeeting(contextMenuMeeting.id);
                    handleContextMenuClose();
                  }}
                >
                  삭제
                </button>
              </div>
            )}

            {/* 컨텍스트 메뉴 외부 클릭 감지 */}
            {contextMenu && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 999
                }}
                onClick={handleContextMenuClose}
              />
            )}
          </>
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
