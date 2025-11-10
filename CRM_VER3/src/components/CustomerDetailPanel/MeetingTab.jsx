import React, { useState, useEffect, useRef } from 'react';
import { PROPERTY_STATUSES } from '../../constants';
import { generateId, formatDateTime } from '../../utils/helpers';
import { parsePropertyDetails } from '../../utils/textParser';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const MeetingTab = ({ customerId, customerName, meetings, onSaveMeeting, onDeleteMeeting, initialProperties, onClearInitialProperties, selectedMeetingId }) => {
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

  // 외부에서 미팅이 선택되면 모달 자동 오픈
  useEffect(() => {
    if (selectedMeetingId) {
      const meeting = meetings.find(m => m.id === selectedMeetingId);
      if (meeting) {
        setViewingMeeting(meeting);
      }
    }
  }, [selectedMeetingId, meetings]);

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
        const nextOrder = formData.properties.length + 1;
        const newProperty = { id: generateId(), roomName: '', visitTime: '', agency: '', agencyPhone: '', info: '', customerResponse: '', photos: ['', ''], status: PROPERTY_STATUSES[0], order: nextOrder };
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
        propertyToEdit || { roomName: '', visitTime: '', agency: '', agencyPhone: '', info: '', customerResponse: '', photos: ['', ''], status: PROPERTY_STATUSES[0], order: editIndex !== null ? editIndex + 1 : 1 }
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
                    <span className="property-detail">{prop.agency}</span>
                    <span className="property-detail">
                      {prop.agencyPhone ? <a href={`sms:${prop.agencyPhone}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{prop.agencyPhone}</a> : ''}
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

  const PropertiesViewModal = ({ meeting, onClose, onSaveMeeting }) => {
    const [editingPropertyIndex, setEditingPropertyIndex] = useState(null);
    const [showPropertyEditModal, setShowPropertyEditModal] = useState(false);
    const [editingInfoIndex, setEditingInfoIndex] = useState(null);
    const [editingInfoValue, setEditingInfoValue] = useState('');
    const [editingResponseIndex, setEditingResponseIndex] = useState(null);
    const [editingResponseValue, setEditingResponseValue] = useState('');
    const scrollContainerRef = useRef(null);
    const scrollPositionRef = useRef(0);
    const [photoSourcePropertyIndex, setPhotoSourcePropertyIndex] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const cameraInputRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const [expandedPropertyCards, setExpandedPropertyCards] = useState(new Set());
    const [memoText, setMemoText] = useState(meeting.memo || '');
    const memoTimeoutRef = useRef(null);

    // 매물 카드 아코디언 토글
    const togglePropertyCard = (propertyId) => {
      setExpandedPropertyCards(prev => {
        const newSet = new Set(prev);
        if (newSet.has(propertyId)) {
          newSet.delete(propertyId);
        } else {
          newSet.add(propertyId);
        }
        return newSet;
      });
    };

    // 메모 변경 핸들러 (debounce 적용)
    const handleMemoChange = (newMemo) => {
      setMemoText(newMemo);

      // 기존 타이머 제거
      if (memoTimeoutRef.current) {
        clearTimeout(memoTimeoutRef.current);
      }

      // 500ms 후 저장
      memoTimeoutRef.current = setTimeout(() => {
        onSaveMeeting({
          ...meeting,
          memo: newMemo
        });
      }, 500);
    };

    // 순서 순으로 정렬 (원본 인덱스 보존)
    // photos 필드 초기화
    const normalizedProperties = meeting.properties?.map((prop, index) => ({
      ...prop,
      order: prop.order !== undefined ? prop.order : index + 1,
      photos: prop.photos || ['', '']
    })) || [];

    const sortedProperties = normalizedProperties.map((prop, originalIndex) => ({ prop, originalIndex }))
      .sort((a, b) => {
        const orderA = a.prop.order || 999;
        const orderB = b.prop.order || 999;
        return orderA - orderB;
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

      // 이미지 압축을 위해 Canvas 사용
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Canvas 생성
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // 이미지 크기 조정 (최대 800x800)
          let width = img.width;
          let height = img.height;
          const maxSize = 800;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            } else {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // JPEG 포맷으로 압축 (품질 0.7)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

          const newProperties = [...meeting.properties];
          const photos = newProperties[originalIndex].photos || ['', ''];
          photos[photoIndex] = compressedBase64;
          newProperties[originalIndex] = { ...newProperties[originalIndex], photos };
          const updatedMeeting = { ...meeting, properties: newProperties };
          onSaveMeeting(updatedMeeting);
          setViewingMeeting(updatedMeeting);
        };
        img.src = event.target?.result;
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

      if (source === 'camera') {
        cameraInputRef.current?.click();
      } else if (source === 'file') {
        fileInputRef.current?.click();
      }

      // photoSourcePropertyIndex는 파일 선택 후 onChange에서 리셋됨
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
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', maxHeight: '85vh', height: '85vh' }}>
          <div className="modal-header">
            <h3>미팅 매물 - {formatDateTime(meeting.date)}</h3>
            <button className="btn-close" onClick={onClose}>×</button>
          </div>
          <div style={{ display: 'flex', flex: 1, gap: '0', overflow: 'hidden', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
            {/* 좌측: 매물 목록 */}
            <div style={{ flex: window.innerWidth < 768 ? '1' : '2', display: 'flex', flexDirection: 'column', borderRight: window.innerWidth < 768 ? 'none' : '1px solid #e0e0e0', borderBottom: window.innerWidth < 768 ? '1px solid #e0e0e0' : 'none', overflow: 'hidden' }}>
              <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
            {sortedProperties.length > 0 ? (
              sortedProperties.map(({ prop, originalIndex }) => (
                <div key={prop.id} className="property-card" style={{ marginBottom: '15px' }}>
                  <div
                    className="property-card-header"
                    onClick={() => togglePropertyCard(prop.id)}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      paddingRight: '8px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontSize: '12px', color: '#999', minWidth: '16px' }}>
                      {expandedPropertyCards.has(prop.id) ? '▼' : '▶'}
                    </span>
                    <div className="property-room-name">🏠 {prop.roomName || '미지정'}</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
                      <select
                        className="property-status-badge"
                        value={prop.order || originalIndex + 1}
                        onChange={(e) => {
                          // 순서 변경 시에만 스크롤 위치 복원
                          scrollPositionRef.current = scrollContainerRef.current?.scrollTop || 0;
                          const newProperties = [...meeting.properties];
                          newProperties[originalIndex] = {...newProperties[originalIndex], order: parseInt(e.target.value)};
                          const updatedMeeting = {...meeting, properties: newProperties};
                          onSaveMeeting(updatedMeeting);
                          setViewingMeeting(updatedMeeting);
                          setTimeout(() => {
                            if (scrollContainerRef.current && scrollPositionRef.current !== undefined) {
                              scrollContainerRef.current.scrollTop = scrollPositionRef.current;
                            }
                          }, 0);
                        }}
                        style={{
                          cursor: 'pointer',
                          border: 'none',
                          fontWeight: 'bold',
                          backgroundColor: '#e0e0e0',
                          color: '#333',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                      <select
                        className={`property-status-badge status-${prop.status}`}
                        value={prop.status}
                        onChange={(e) => {
                          const newProperties = [...meeting.properties];
                          const newStatus = e.target.value;

                          // 준비상태에 따라 순서 자동 변경
                          let newOrder = prop.order;
                          if (newStatus === '계약됨') {
                            newOrder = 9;
                          } else if (newStatus === '오늘못봄') {
                            newOrder = 8;
                          }

                          newProperties[originalIndex] = {...newProperties[originalIndex], status: newStatus, order: newOrder};
                          const updatedMeeting = {...meeting, properties: newProperties};
                          onSaveMeeting(updatedMeeting);
                          setViewingMeeting(updatedMeeting);
                        }}
                        style={{ cursor: 'pointer', border: 'none', fontWeight: 'bold' }}
                      >
                        {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  {expandedPropertyCards.has(prop.id) && (
                    <div className="property-card-body">
                      <div
                        className="property-info-label"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          marginBottom: '8px'
                        }}
                      >
                        <span>📋 매물정보</span>
                      </div>

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
                  )}
                  {expandedPropertyCards.has(prop.id) && (
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
                  )}
                  {expandedPropertyCards.has(prop.id) && prop.photos && prop.photos.some(photo => photo) && (
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
                    <span className="property-detail">• {prop.agency}</span>
                    <span className="property-detail">
                      • {prop.agencyPhone ? <a href={`sms:${prop.agencyPhone}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{prop.agencyPhone}</a> : ''}
                    </span>
                    <span className="property-detail" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      •
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
                  {expandedPropertyCards.has(prop.id) && (
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
                      <button onClick={() => handlePropertyEdit(originalIndex)} className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>수정</button>
                      <button onClick={() => handlePropertyDelete(originalIndex)} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>삭제</button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                등록된 매물이 없습니다.
              </div>
            )}
              </div>
              {/* 좌측 푸터 (보고서 버튼) */}
              <div style={{ padding: '10px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '14px', backgroundColor: '#FF6B9D' }}
                >
                  📄 보고서
                </button>
              </div>
            </div>

            {/* 우측: 메모 영역 */}
            <div style={{ flex: window.innerWidth < 768 ? '1' : '1', display: 'flex', flexDirection: 'column', padding: '15px', backgroundColor: '#fafafa', minHeight: window.innerWidth < 768 ? '200px' : 'auto' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>📝 메모</div>
              <textarea
                value={memoText}
                onChange={(e) => handleMemoChange(e.target.value)}
                placeholder="이 미팅에 대한 메모를 작성하세요..."
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  overflow: 'auto'
                }}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #e0e0e0', padding: '10px 15px' }}>
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              취소
            </button>
            <button
              onClick={() => {
                alert('모든 변경사항이 저장되었습니다.');
                onClose();
              }}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              저장
            </button>
          </div>

          {/* 보고서 모달 */}
          {showReportModal && (
            <MeetingReportModal
              meeting={meeting}
              onClose={() => setShowReportModal(false)}
              onSaveMeeting={onSaveMeeting}
            />
          )}
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

          {/* 숨겨진 파일 입력 요소 */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={(e) => {
              const currentPropertyIndex = photoSourcePropertyIndex;
              if (currentPropertyIndex !== null) {
                const property = meeting.properties[currentPropertyIndex];
                const photos = property?.photos || ['', ''];
                const emptyPhotoIndex = photos.findIndex(p => !p);
                if (emptyPhotoIndex !== -1) {
                  handlePhotoUpload(e, currentPropertyIndex, emptyPhotoIndex);
                }
              }
              setPhotoSourcePropertyIndex(null);
            }}
            style={{ display: 'none' }}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => {
              const currentPropertyIndex = photoSourcePropertyIndex;
              if (currentPropertyIndex !== null) {
                const property = meeting.properties[currentPropertyIndex];
                const photos = property?.photos || ['', ''];
                const emptyPhotoIndex = photos.findIndex(p => !p);
                if (emptyPhotoIndex !== -1) {
                  handlePhotoUpload(e, currentPropertyIndex, emptyPhotoIndex);
                }
              }
              setPhotoSourcePropertyIndex(null);
            }}
            style={{ display: 'none' }}
          />
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
                      onClick={() => setViewingMeeting(meeting)}
                    >
                      <td style={{ color: isTodayMeeting ? '#d32f2f' : 'inherit', cursor: 'pointer' }}>
                        {formatMeetingDateTime(meeting.date, meeting.properties?.length || 0)}
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

        {viewingMeeting && <PropertiesViewModal meeting={viewingMeeting} onClose={() => setViewingMeeting(null)} onSaveMeeting={onSaveMeeting} />}
    </div>
  );
};

// 미팅 보고서 모달 컴포넌트
const MeetingReportModal = ({ meeting, onClose, onSaveMeeting }) => {
  const [overallComment, setOverallComment] = useState(meeting.overallComment || '');
  const reportRef = useRef(null);

  // 방문시간 순으로 정렬된 매물 (원본 인덱스 보존)
  const sortedPropertiesWithIndex = meeting.properties && meeting.properties.length > 0
    ? meeting.properties
        .map((prop, originalIndex) => ({ prop, originalIndex }))
        .sort((a, b) => {
          if (!a.prop.visitTime) return 1;
          if (!b.prop.visitTime) return -1;
          return a.prop.visitTime.localeCompare(b.prop.visitTime);
        })
    : [];

  const [editingFields, setEditingFields] = useState({});

  const handlePropertyFieldEdit = (propertyIdx, field, value) => {
    const newProperties = [...meeting.properties];
    if (field === 'customerResponse' || field === 'leaseInfo' || field === 'info') {
      newProperties[propertyIdx] = { ...newProperties[propertyIdx], [field]: value };
      onSaveMeeting({ ...meeting, properties: newProperties });
    }
  };

  const handleSaveReport = () => {
    const updatedMeeting = { ...meeting, overallComment };
    onSaveMeeting(updatedMeeting);
    alert('보고서가 저장되었습니다.');
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowHeight: reportRef.current.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      const fileName = `미팅보고서_${formatDateTime(meeting.date).replace(/[:\s]/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      alert('PDF 다운로드에 실패했습니다: ' + error.message);
    }
  };

  const handleDownloadImage = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `미팅보고서_${formatDateTime(meeting.date).replace(/[:\s]/g, '_')}.png`;
      link.click();
    } catch (error) {
      alert('이미지 다운로드에 실패했습니다: ' + error.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>미팅 보고서</h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        {/* 보고서 프리뷰 */}
        <div ref={reportRef} style={{ padding: '40px', backgroundColor: '#ffffff', fontSize: '14px', lineHeight: '1.8' }}>
          {/* 헤더 */}
          <div style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #333' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>미팅 보고서</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '13px', color: '#666' }}>
              <span><strong>미팅날짜:</strong> {formatDateTime(meeting.date)}</span>
            </div>
          </div>

          {/* 매물 리스트 */}
          {sortedPropertiesWithIndex && sortedPropertiesWithIndex.length > 0 ? (
            <div style={{ marginBottom: '30px' }}>
              {sortedPropertiesWithIndex.map(({ prop, originalIndex }, idx) => (
                <div key={idx} style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #ddd', pageBreakInside: 'avoid' }}>
                  {/* 매물 번호와 호실 */}
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#2196F3' }}>
                    매물 {idx + 1}. {prop.roomName || '미지정'}
                  </h3>

                  {/* 매물 상세 정보 - 소재지, 임대료, 구조정보, 특징만 표시 */}
                  <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '3px solid #2196F3' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      📋 매물정보
                      <span style={{ fontSize: '11px', color: '#999', cursor: 'pointer' }} onClick={() => setEditingFields({ ...editingFields, [`info_${originalIndex}`]: !editingFields[`info_${originalIndex}`] })}>
                        {editingFields[`info_${originalIndex}`] ? '✓' : '✎'}
                      </span>
                    </div>
                    {editingFields[`info_${originalIndex}`] ? (
                      <textarea
                        value={prop.info || ''}
                        onChange={(e) => handlePropertyFieldEdit(originalIndex, 'info', e.target.value)}
                        style={{ width: '100%', minHeight: '120px', padding: '6px', border: '1px solid #ccc', borderRadius: '3px', fontFamily: 'inherit', fontSize: '12px' }}
                        placeholder="매물정보를 입력하세요"
                      />
                    ) : (
                      <div style={{ fontSize: '12px', lineHeight: '1.8', color: '#333' }}>
                        {prop.info && prop.info.split('\n').map((line, idx) => {
                          // 소재지, 임대료, 구조정보, 특징만 표시 (부동산과 연락처는 제외)
                          if (line.includes('• 소재지:') || line.includes('• 임대료:') || line.includes('• 구조정보:') || line.includes('• 특징:')) {
                            return <div key={idx} style={{ marginBottom: '4px' }}>{line}</div>;
                          }
                          return null;
                        })}
                        {(!prop.info || prop.info.trim() === '') && <div style={{ color: '#999' }}>입력된 내용 없음</div>}
                      </div>
                    )}
                  </div>

                  {/* 고객반응 및 임대차정보 */}
                  <div style={{ marginBottom: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                    <div style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '3px solid #FF6B9D' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        💬 고객반응
                        <span style={{ fontSize: '11px', color: '#999', cursor: 'pointer' }} onClick={() => setEditingFields({ ...editingFields, [`response_${originalIndex}`]: !editingFields[`response_${originalIndex}`] })}>
                          {editingFields[`response_${originalIndex}`] ? '✓' : '✎'}
                        </span>
                      </div>
                      {editingFields[`response_${originalIndex}`] ? (
                        <textarea
                          value={prop.customerResponse || ''}
                          onChange={(e) => handlePropertyFieldEdit(originalIndex, 'customerResponse', e.target.value)}
                          style={{ width: '100%', minHeight: '80px', padding: '6px', border: '1px solid #ccc', borderRadius: '3px', fontFamily: 'inherit', fontSize: '12px' }}
                          placeholder="고객반응을 입력하세요"
                        />
                      ) : (
                        <div style={{ color: '#333', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.4', minHeight: '20px' }}>
                          {prop.customerResponse || '입력된 내용 없음'}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '3px solid #4CAF50' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        ⭐ 특이사항
                        <span style={{ fontSize: '11px', color: '#999', cursor: 'pointer' }} onClick={() => setEditingFields({ ...editingFields, [`lease_${originalIndex}`]: !editingFields[`lease_${originalIndex}`] })}>
                          {editingFields[`lease_${originalIndex}`] ? '✓' : '✎'}
                        </span>
                      </div>
                      {editingFields[`lease_${originalIndex}`] ? (
                        <textarea
                          value={prop.leaseInfo || ''}
                          onChange={(e) => handlePropertyFieldEdit(originalIndex, 'leaseInfo', e.target.value)}
                          style={{ width: '100%', minHeight: '80px', padding: '6px', border: '1px solid #ccc', borderRadius: '3px', fontFamily: 'inherit', fontSize: '12px' }}
                          placeholder="특이사항을 입력하세요"
                        />
                      ) : (
                        <div style={{ color: '#333', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.4', minHeight: '20px' }}>
                          {prop.leaseInfo || '입력된 내용 없음'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 사진 */}
                  {prop.photos && prop.photos.some(photo => photo) && (
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>📷 사진</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {prop.photos.map((photo, photoIdx) => (
                          photo && (
                            <img
                              key={photoIdx}
                              src={photo}
                              alt={`사진 ${photoIdx + 1}`}
                              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>등록된 매물이 없습니다.</div>
          )}

          {/* 총평 */}
          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#333' }}>📋 총평</h4>
              <span style={{ fontSize: '11px', color: '#999', cursor: 'pointer' }} onClick={() => setEditingFields({ ...editingFields, 'overallComment': !editingFields['overallComment'] })}>
                {editingFields['overallComment'] ? '✓' : '✎'}
              </span>
            </div>
            {editingFields['overallComment'] ? (
              <textarea
                value={overallComment}
                onChange={(e) => setOverallComment(e.target.value)}
                placeholder="미팅에 대한 종합 의견을 작성해주세요..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  resize: 'vertical'
                }}
              />
            ) : (
              <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', minHeight: '80px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#333' }}>
                {overallComment || '(종합 의견을 입력해주세요)'}
              </div>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '15px' }}>
          <button
            onClick={handleDownloadImage}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            🖼️ 이미지 저장
          </button>
          <button
            onClick={handleDownloadPDF}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            📄 PDF 저장
          </button>
          <button
            onClick={handleSaveReport}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FF6B9D',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            💾 저장
          </button>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingTab;
