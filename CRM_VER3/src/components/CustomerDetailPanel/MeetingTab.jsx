import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PROPERTY_STATUSES } from '../../constants';
import { generateId, formatDateTime } from '../../utils/helpers';
import { parsePropertyDetails, generateStructuredPropertyInfo, extractJibun } from '../../utils/textParser';
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

  // 미팅 찾기 함수를 메모이제이션 (selectedMeetingId가 변경될 때만 재생성)
  const findMeeting = useCallback(() => {
    if (selectedMeetingId) {
      return meetings.find(m => m.id === selectedMeetingId);
    }
    return null;
  }, [selectedMeetingId]);

  // 외부에서 미팅이 선택되면 모달 자동 오픈
  useEffect(() => {
    const meeting = findMeeting();
    if (meeting) {
      setViewingMeeting(meeting);
    }
  }, [findMeeting]);

  // 오늘 날짜 확인 함수
  const isToday = (dateString) => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const meetingDate = dateString.slice(0, 10);
    return meetingDate === todayStr;
  };

  // D-Day 계산 함수
  const calculateDDay = (dateString) => {
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const meetingDateStr = dateString.slice(0, 10);
    const [year, month, day] = meetingDateStr.split('-').map(Number);
    const meetingDate = new Date(year, month - 1, day);
    const timeDiff = meetingDate - todayDate;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  const customerMeetings = meetings
    .filter(m => m.customerId === customerId)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

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
        const newProperty = { id: generateId(), roomName: '', visitTime: '', agency: '', agencyPhone: '', info: '', customerResponse: '', photos: ['', '', '', ''], status: PROPERTY_STATUSES[0], order: nextOrder };
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
        propertyToEdit || { roomName: '', agency: '', agencyPhone: '', info: '', jibun: '', visitTime: '', customerResponse: '', photos: ['', '', '', ''], status: PROPERTY_STATUSES[0], order: editIndex !== null ? editIndex + 1 : 1 }
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

        // 3. 정리본에서 호실명, 부동산, 연락처, 지번 자동 추출
        const { propertyName, agencyName, contactNumber } = parsePropertyDetails(structuredInfo);
        const jibun = extractJibun(structuredInfo);

        updatedData.roomName = propertyName || propertyData.roomName;
        updatedData.agency = agencyName || propertyData.agency;
        updatedData.agencyPhone = contactNumber || propertyData.agencyPhone;
        updatedData.jibun = jibun || propertyData.jibun;

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
                  placeholder="매물 정보를 붙여넣으세요&#10;아래 '⚡ 매물정보 자동 생성' 버튼을 클릭하면&#10;호실명, 부동산, 연락처가 자동으로 입력됩니다"
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
                    ? '매물 정보를 붙여넣고 아래 \'⚡ 매물정보 자동 생성\' 버튼을 클릭하면 호실명, 부동산, 연락처가 자동으로 입력됩니다.'
                    : '매물 정보를 붙여넣고 아래 \'⚡ 매물정보 자동 생성\' 버튼을 클릭하면 호실명, 부동산, 연락처가 자동으로 입력됩니다.'}
                </p>
              </div>
              <div className="form-group">
                <label>호실명</label>
                <input type="text" placeholder="자동 입력되지만 수정 가능합니다" value={propertyData.roomName} onChange={(e) => setPropertyData({...propertyData, roomName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>지번</label>
                <input type="text" placeholder="자동 입력되지만 수정 가능합니다" value={propertyData.jibun} onChange={(e) => setPropertyData({...propertyData, jibun: e.target.value})} />
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

  const PropertiesViewModal = ({ meeting, onClose, onSaveMeeting, onUpdateMeeting }) => {
    const [editingPropertyIndex, setEditingPropertyIndex] = useState(null);
    const [showPropertyEditModal, setShowPropertyEditModal] = useState(false);
    const [editingInfoIndex, setEditingInfoIndex] = useState(null);
    const [editingInfoValue, setEditingInfoValue] = useState('');
    const [editingResponseIndex, setEditingResponseIndex] = useState(null);
    const [editingResponseValue, setEditingResponseValue] = useState('');
    const [editingRoomNameIndex, setEditingRoomNameIndex] = useState(null);
    const [editingRoomName, setEditingRoomName] = useState('');
    const scrollContainerRef = useRef(null);
    const scrollPositionRef = useRef(0);
    const [photoSourcePropertyIndex, setPhotoSourcePropertyIndex] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const cameraInputRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const roomNameInputRef = useRef(null);

    // 배열 위치 = 순서 (order 필드는 배열 인덱스 기반으로 자동 계산되므로 정렬 불필요)
    // photos 필드 초기화 (4장까지 지원)
    const sortedProperties = (meeting.properties || []).map((prop, index) => ({
      prop: { ...prop, photos: prop.photos || ['', '', '', ''] },
      originalIndex: index
    }));

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
        // 즉시 UI 업데이트
        if (onUpdateMeeting) {
          onUpdateMeeting(updatedMeeting);
        }
      }
    };

    // 위로 이동 (배열 스왑)
    const handleMoveUp = (currentIndex) => {
      if (currentIndex <= 0) return;

      scrollPositionRef.current = scrollContainerRef.current?.scrollTop || 0;

      const newProperties = [...meeting.properties];
      // 배열 스왑
      [newProperties[currentIndex], newProperties[currentIndex - 1]] =
      [newProperties[currentIndex - 1], newProperties[currentIndex]];

      // order 필드 재계산
      newProperties.forEach((prop, idx) => {
        prop.order = idx + 1;
      });

      const updatedMeeting = { ...meeting, properties: newProperties };
      onSaveMeeting(updatedMeeting);
      if (onUpdateMeeting) {
        onUpdateMeeting(updatedMeeting);
      }

      setTimeout(() => {
        if (scrollContainerRef.current && scrollPositionRef.current !== undefined) {
          scrollContainerRef.current.scrollTop = scrollPositionRef.current;
        }
      }, 0);
    };

    // 아래로 이동 (배열 스왑)
    const handleMoveDown = (currentIndex) => {
      if (currentIndex >= meeting.properties.length - 1) return;

      scrollPositionRef.current = scrollContainerRef.current?.scrollTop || 0;

      const newProperties = [...meeting.properties];
      // 배열 스왑
      [newProperties[currentIndex], newProperties[currentIndex + 1]] =
      [newProperties[currentIndex + 1], newProperties[currentIndex]];

      // order 필드 재계산
      newProperties.forEach((prop, idx) => {
        prop.order = idx + 1;
      });

      const updatedMeeting = { ...meeting, properties: newProperties };
      onSaveMeeting(updatedMeeting);
      if (onUpdateMeeting) {
        onUpdateMeeting(updatedMeeting);
      }

      setTimeout(() => {
        if (scrollContainerRef.current && scrollPositionRef.current !== undefined) {
          scrollContainerRef.current.scrollTop = scrollPositionRef.current;
        }
      }, 0);
    };

    const addProperty = () => {
      const newProperty = {
        id: generateId(),
        roomName: '',
        visitTime: '',
        agency: '',
        agencyPhone: '',
        info: '',
        customerResponse: '',
        photos: ['', '', '', ''],
        status: PROPERTY_STATUSES[0],
        order: (meeting.properties?.length || 0) + 1
      };
      const updatedProperties = [...(meeting.properties || []), newProperty];
      const updatedMeeting = {
        ...meeting,
        properties: updatedProperties
      };
      onSaveMeeting(updatedMeeting);
      if (onUpdateMeeting) {
        onUpdateMeeting(updatedMeeting);
      }
    };

    // 호실명 더블클릭 편집
    const handleRoomNameDoubleClick = (originalIndex) => {
      setEditingRoomNameIndex(originalIndex);
      setEditingRoomName(meeting.properties[originalIndex].roomName || '');
      setTimeout(() => {
        roomNameInputRef.current?.focus();
        roomNameInputRef.current?.select();
      }, 0);
    };

    const handleRoomNameSave = (originalIndex) => {
      if (editingRoomNameIndex === originalIndex && editingRoomName.trim()) {
        const newProperties = [...meeting.properties];
        newProperties[originalIndex] = { ...newProperties[originalIndex], roomName: editingRoomName };
        const updatedMeeting = { ...meeting, properties: newProperties };
        onSaveMeeting(updatedMeeting);
        if (onUpdateMeeting) {
          onUpdateMeeting(updatedMeeting);
        }
      }
      setEditingRoomNameIndex(null);
      setEditingRoomName('');
    };

    const handleRoomNameCancel = () => {
      setEditingRoomNameIndex(null);
      setEditingRoomName('');
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
        if (onUpdateMeeting) {
          onUpdateMeeting(updatedMeeting);
        }
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
        if (onUpdateMeeting) {
          onUpdateMeeting(updatedMeeting);
        }
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
          const photos = newProperties[originalIndex].photos || ['', '', '', ''];
          photos[photoIndex] = compressedBase64;
          newProperties[originalIndex] = { ...newProperties[originalIndex], photos };
          const updatedMeeting = { ...meeting, properties: newProperties };
          onSaveMeeting(updatedMeeting);
          if (onUpdateMeeting) {
            onUpdateMeeting(updatedMeeting);
          }
        };
        img.src = event.target?.result;
      };
      reader.readAsDataURL(file);
    };

    const handlePhotoDelete = (originalIndex, photoIndex) => {
      const newProperties = [...meeting.properties];
      const photos = newProperties[originalIndex].photos || ['', '', '', ''];
      photos[photoIndex] = '';
      newProperties[originalIndex] = { ...newProperties[originalIndex], photos };
      const updatedMeeting = { ...meeting, properties: newProperties };
      onSaveMeeting(updatedMeeting);
      if (onUpdateMeeting) {
        onUpdateMeeting(updatedMeeting);
      }
    };

    const triggerPhotoUpload = (originalIndex) => {
      const property = meeting.properties[originalIndex];
      const photos = property?.photos || ['', '', '', ''];
      const emptyPhotoIndex = photos.findIndex(p => !p);

      if (emptyPhotoIndex !== -1) {
        setPhotoSourcePropertyIndex(originalIndex);
      } else {
        alert('최대 4장까지 첨부할 수 있습니다.');
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
      // 즉시 UI 업데이트
      if (onUpdateMeeting) {
        onUpdateMeeting(updatedMeeting);
      }
      setShowPropertyEditModal(false);
      setEditingPropertyIndex(null);
    };

    const PropertyEditModal = ({ propertyToEdit, editIndex, onClose }) => {
      const [propertyData, setPropertyData] = useState(
        propertyToEdit || { roomName: '', agency: '', agencyPhone: '', info: '', jibun: '', visitTime: '', customerResponse: '', photos: ['', '', '', ''], status: PROPERTY_STATUSES[0] }
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

        // 3. 정리본에서 호실명, 부동산, 연락처, 지번 자동 추출
        const { propertyName, agencyName, contactNumber } = parsePropertyDetails(structuredInfo);
        const jibun = extractJibun(structuredInfo);

        updatedData.roomName = propertyName || propertyData.roomName;
        updatedData.agency = agencyName || propertyData.agency;
        updatedData.agencyPhone = contactNumber || propertyData.agencyPhone;
        updatedData.jibun = jibun || propertyData.jibun;

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
                  원본 매물정보를 붙여넣고 아래 '⚡ 매물정보 자동 생성' 버튼을 클릭하면 호실명, 부동산, 연락처가 자동으로 입력됩니다.
                </p>
              </div>
              <div className="form-group">
                <label>호실명</label>
                <input type="text" placeholder="자동 입력되지만 수정 가능합니다" value={propertyData.roomName} onChange={(e) => setPropertyData({...propertyData, roomName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>지번</label>
                <input type="text" placeholder="자동 입력되지만 수정 가능합니다" value={propertyData.jibun} onChange={(e) => setPropertyData({...propertyData, jibun: e.target.value})} />
              </div>
              <div className="form-group">
                <label>부동산</label>
                <input type="text" value={propertyData.agency} onChange={(e) => setPropertyData({...propertyData, agency: e.target.value})} />
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
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', maxHeight: window.innerWidth < 768 ? '100vh' : '85vh', height: window.innerWidth < 768 ? '100vh' : '85vh', width: window.innerWidth < 768 ? '100%' : 'auto', maxWidth: window.innerWidth < 768 ? '100vw' : window.innerWidth * 0.9, minWidth: window.innerWidth < 768 ? 'auto' : '800px' }}>
          <div className="modal-header" style={{ height: window.innerWidth < 768 ? '40px' : 'auto', padding: window.innerWidth < 768 ? '8px 15px' : '15px' }}>
            <h3 style={{ fontSize: window.innerWidth < 768 ? '14px' : 'inherit', margin: window.innerWidth < 768 ? '0' : 'inherit' }}>미팅 매물 - {formatDateTime(meeting.date)}</h3>
            <button className="btn-close" onClick={onClose}>×</button>
          </div>
          <div style={{ display: 'flex', flex: 1, gap: window.innerWidth < 768 ? '0' : '10px', overflow: 'hidden', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
            {/* 좌측: 매물 목록 */}
            <div style={{ flex: window.innerWidth < 768 ? '2' : '2', display: 'flex', flexDirection: 'column', borderRight: 'none', borderBottom: window.innerWidth < 768 ? '1px solid #e0e0e0' : 'none', overflow: 'hidden' }}>
              <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
            {sortedProperties.length > 0 ? (
              sortedProperties.map(({ prop, originalIndex }, index) => (
                <div key={prop.id} className="property-card" style={{ marginBottom: '15px', marginTop: window.innerWidth < 768 ? '15px' : (index === 0 ? '0' : '15px'), width: window.innerWidth < 768 ? 'auto' : '90%', marginLeft: window.innerWidth < 768 ? '0' : 'auto', marginRight: window.innerWidth < 768 ? '0' : 'auto' }}>
                  <div
                    className="property-card-header"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      paddingRight: '8px',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {editingRoomNameIndex === originalIndex ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flex: 1,
                          backgroundColor: '#fff3cd',
                          border: '2px solid #ffc107',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          marginRight: '8px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>🏠</span>
                        <input
                          ref={roomNameInputRef}
                          type="text"
                          value={editingRoomName}
                          onChange={(e) => setEditingRoomName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRoomNameSave(originalIndex);
                            if (e.key === 'Escape') handleRoomNameCancel();
                          }}
                          onBlur={() => handleRoomNameSave(originalIndex)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            flex: 1,
                            outline: 'none',
                            padding: 0
                          }}
                          placeholder="호실명 입력..."
                        />
                      </div>
                    ) : (
                      <div
                        className="property-room-name"
                        onDoubleClick={() => handleRoomNameDoubleClick(originalIndex)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flex: 1,
                          backgroundColor: '#e3f2fd',
                          border: '2px solid #2196F3',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'all 0.2s ease',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                        title="더블클릭으로 편집"
                      >
                        🏠 {prop.roomName || '미지정'}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
                      {/* 위로 이동 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveUp(originalIndex);
                        }}
                        disabled={index === 0}
                        style={{
                          backgroundColor: index === 0 ? '#ccc' : '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          width: '28px',
                          height: '28px',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          opacity: index === 0 ? 0.4 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="위로 이동"
                      >
                        ▲
                      </button>

                      {/* 아래로 이동 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveDown(originalIndex);
                        }}
                        disabled={index === sortedProperties.length - 1}
                        style={{
                          backgroundColor: index === sortedProperties.length - 1 ? '#ccc' : '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          width: '28px',
                          height: '28px',
                          cursor: index === sortedProperties.length - 1 ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          opacity: index === sortedProperties.length - 1 ? 0.4 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="아래로 이동"
                      >
                        ▼
                      </button>
                      <select
                        className={`property-status-badge status-${prop.status}`}
                        value={prop.status}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          let newProperties = [...meeting.properties];

                          // 특정 상태일 경우 배열 끝으로 이동
                          if (newStatus === '오늘못봄' || newStatus === '계약됨' ||
                              newStatus === '현장방문완료' || newStatus === '안보기로함') {

                            // 1. 해당 매물을 배열에서 제거
                            const [removedItem] = newProperties.splice(originalIndex, 1);

                            // 2. 상태 변경 후 배열 끝에 추가
                            newProperties.push({ ...removedItem, status: newStatus });

                          } else {
                            // 일반 상태 변경 (위치 유지)
                            newProperties[originalIndex] = { ...newProperties[originalIndex], status: newStatus };
                          }

                          // order 필드 재계산 (모든 경우)
                          newProperties.forEach((prop, idx) => {
                            prop.order = idx + 1;
                          });

                          const updatedMeeting = { ...meeting, properties: newProperties };
                          onSaveMeeting(updatedMeeting);
                          if (onUpdateMeeting) {
                            onUpdateMeeting(updatedMeeting);
                          }
                        }}
                        style={{ cursor: 'pointer', border: 'none', fontWeight: 'bold' }}
                      >
                        {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="property-card-body">
                      <div
                        className="property-info-label"
                        style={{
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
                          if (onUpdateMeeting) {
                            onUpdateMeeting(updatedMeeting);
                          }
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
                    {/* 좌측 정렬: 지번 정보 및 지도 버튼 */}
                    <div style={{ marginRight: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {prop.jibun && (
                        <>
                          <span style={{ fontSize: '12px', color: '#555', fontWeight: '500' }}>
                            📍 {prop.jibun}
                          </span>
                          <button
                            onClick={() => {
                              // 카카오맵 검색 URL로 열기
                              const mapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(prop.jibun)}`;
                              window.open(mapUrl, '_blank');
                            }}
                            title="카카오맵에서 보기"
                            style={{
                              backgroundColor: '#FEE500',
                              color: '#333',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 10px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            🗺️ 지도
                          </button>
                        </>
                      )}
                    </div>

                    {/* 우측 정렬: 액션 버튼 */}
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
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                등록된 매물이 없습니다.
              </div>
            )}
              </div>
            </div>

          </div>

          <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #e0e0e0', padding: '10px 15px' }}>
            <button
              onClick={addProperty}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '14px', backgroundColor: '#4CAF50', marginRight: 'auto' }}
            >
              ➕ 매물추가
            </button>
            {window.innerWidth >= 768 && (
              <button
                onClick={() => setShowReportModal(true)}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '14px', backgroundColor: '#FF6B9D' }}
              >
                📄 보고서
              </button>
            )}
            {window.innerWidth < 768 && (
              <button
                onClick={() => setShowReportModal(true)}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '14px', backgroundColor: '#FF6B9D' }}
              >
                📄 보고서
              </button>
            )}
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
                const photos = property?.photos || ['', '', '', ''];
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
                const photos = property?.photos || ['', '', '', ''];
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {customerMeetings.map(meeting => {
                const isTodayMeeting = isToday(meeting.date);
                const daysLeft = calculateDDay(meeting.date);
                const propertiesCount = meeting.properties?.length || 0;
                // order 필드로 정렬된 매물 목록
                const sortedProperties = (meeting.properties || []).sort((a, b) => (a.order || 0) - (b.order || 0));

                return (
                  <div
                    key={meeting.id}
                    className="meeting-card"
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '14px',
                      backgroundColor: isTodayMeeting ? '#ffebee' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderLeft: '4px solid ' + (isTodayMeeting ? '#d32f2f' : '#2196F3'),
                      position: 'relative'
                    }}
                    onClick={() => setViewingMeeting(meeting)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* 헤더: 시간 + D-Day 배지 + 메뉴 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: isTodayMeeting ? '#d32f2f' : '#2196F3'
                        }}>
                          {meeting.date}
                        </span>

                        {/* D-Day 배지 */}
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: '#fff',
                          backgroundColor: isTodayMeeting ? '#d32f2f' : (daysLeft > 0 ? '#ff9800' : '#999'),
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          {isTodayMeeting ? '🔴 오늘' : daysLeft > 0 ? `D-${daysLeft}` : `+${Math.abs(daysLeft)}일`}
                        </span>
                      </div>

                      {/* 메뉴 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, meeting);
                        }}
                        style={{
                          border: 'none',
                          background: 'none',
                          fontSize: '18px',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          opacity: 0.6,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '1'}
                        onMouseLeave={(e) => e.target.style.opacity = '0.6'}
                      >
                        ⋮
                      </button>
                    </div>

                    {/* 매물 정보 */}
                    <div style={{
                      fontSize: '13px',
                      color: '#666',
                      marginBottom: '8px'
                    }}>
                      📍 <span style={{ fontWeight: 'bold', color: '#333' }}>{propertiesCount}개 매물</span>
                      {sortedProperties.length > 0 && (
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '4px', lineHeight: '1.6' }}>
                          {sortedProperties.map((prop, idx) => (
                            <div key={prop.id} style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                              {idx + 1}. {prop.roomName || prop.agency || '미팅'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

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

        {viewingMeeting && <PropertiesViewModal meeting={viewingMeeting} onClose={() => setViewingMeeting(null)} onSaveMeeting={onSaveMeeting} onUpdateMeeting={(updatedMeeting) => setViewingMeeting(updatedMeeting)} />}
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
