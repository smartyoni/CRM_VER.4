import React, { useState } from 'react';
import { generateId, formatDateTime } from '../../utils/helpers';

const ActivityTab = ({ customerId, activities, onSaveActivity, onDeleteActivity }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [viewingActivity, setViewingActivity] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, selectedActivity: null });

  const customerActivities = activities
    .filter(a => a.customerId === customerId)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신순 정렬

  const handleSave = (activityData) => {
    onSaveActivity(activityData);
    setIsAdding(false);
    setEditingActivity(null);
  };

  const handleContextMenu = (e, activity) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, selectedActivity: activity });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleEdit = () => {
    if (contextMenu.selectedActivity) {
      setEditingActivity(contextMenu.selectedActivity);
    }
    handleCloseContextMenu();
  };

  const handleDelete = () => {
    if (contextMenu.selectedActivity) {
      onDeleteActivity(contextMenu.selectedActivity.id);
    }
    handleCloseContextMenu();
  };

  const formatActivityDate = (date) => {
    if (!date) return '';
    // date가 "YYYY-MM-DD" 형식이면 MM-DD 형식으로 변환
    if (date.length === 10) {
      return date.slice(5, 10); // "10-16"
    }
    // 레거시: datetime 형식도 처리
    if (date.length > 10) {
      return date.slice(5, 10);
    }
    return date;
  };

  const getLatestFollowUp = (activity) => {
    // 가장 최신 후속 기록 반환
    if (activity.followUps && activity.followUps.length > 0) {
      const sortedFollowUps = [...activity.followUps].sort((a, b) => new Date(b.date) - new Date(a.date));
      return sortedFollowUps[0].content;
    }
    return '';
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const ActivityViewModal = ({ activity, onClose }) => {
    const [followUps, setFollowUps] = useState(activity.followUps || []);
    const [editingFollowUpId, setEditingFollowUpId] = useState(null);
    const [newFollowUpContent, setNewFollowUpContent] = useState('');
    const [viewingImage, setViewingImage] = useState(null);

    const handleAddFollowUp = () => {
      if (!newFollowUpContent.trim()) return;

      const followUp = {
        id: generateId(),
        date: new Date().toISOString(),
        content: newFollowUpContent,
        createdAt: new Date().toISOString()
      };
      const updatedFollowUps = [...followUps, followUp];
      const updatedActivity = { ...activity, followUps: updatedFollowUps };
      handleSave(updatedActivity);
      setFollowUps(updatedFollowUps);
      setNewFollowUpContent('');
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        handleAddFollowUp();
      }
    };

    const handleDeleteFollowUp = (followUpId) => {
      if (confirm('이 후속 기록을 삭제하시겠습니까?')) {
        const updatedFollowUps = followUps.filter(f => f.id !== followUpId);
        const updatedActivity = { ...activity, followUps: updatedFollowUps };
        handleSave(updatedActivity);
        setFollowUps(updatedFollowUps);
      }
    };

    const handleEditFollowUp = (followUpId, updatedContent) => {
      const updatedFollowUps = followUps.map(f =>
        f.id === followUpId ? { ...f, content: updatedContent } : f
      );
      const updatedActivity = { ...activity, followUps: updatedFollowUps };
      handleSave(updatedActivity);
      setFollowUps(updatedFollowUps);
      setEditingFollowUpId(null);
    };

    const sortedFollowUps = [...followUps].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
          <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>활동 상세</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>{activity.date}</span>
              <button className="btn-close" onClick={onClose}>×</button>
            </div>
          </div>
          <div style={{ padding: '20px 0' }}>
            {/* 활동 내용 */}
            <div style={{ marginBottom: '25px' }}>
              <p style={{ margin: 0, fontSize: '16px', whiteSpace: 'pre-line', lineHeight: '1.6', fontWeight: 'bold' }}>{activity.content}</p>
            </div>

            {/* 후속 기록 섹션 */}
            <div style={{ borderTop: '2px solid #e0e0e0', paddingTop: '20px', marginBottom: '25px' }}>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#7f8c8d', fontSize: '14px' }}>📝 후속 기록 ({followUps.length})</strong>
              </div>

              {/* 후속 기록 입력창 */}
              <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '5px', padding: '10px', marginBottom: '15px' }}>
                <textarea
                  value={newFollowUpContent}
                  onChange={(e) => setNewFollowUpContent(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="후속 기록을 입력하세요... (Ctrl+Enter로 입력)"
                  style={{
                    width: '100%',
                    padding: '8px',
                    minHeight: '60px',
                    border: 'none',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button onClick={handleAddFollowUp} className="btn-primary" style={{ fontSize: '12px', padding: '6px 16px' }}>
                    입력
                  </button>
                </div>
              </div>

              {/* 입력된 후속 기록들 */}
              {sortedFollowUps.length > 0 ? (
                sortedFollowUps.map(followUp => (
                  <div key={followUp.id} style={{ background: '#f8f9fa', padding: '12px', borderRadius: '5px', marginBottom: '10px', borderLeft: '3px solid var(--primary-blue)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#7f8c8d' }}>{formatDateTime(followUp.date)}</span>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => setEditingFollowUpId(followUp.id)}
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteFollowUp(followUp.id)}
                          className="btn-secondary"
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    {editingFollowUpId === followUp.id ? (
                      <div>
                        <textarea
                          defaultValue={followUp.content}
                          onBlur={(e) => handleEditFollowUp(followUp.id, e.target.value)}
                          style={{ width: '100%', padding: '8px', minHeight: '60px' }}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: '14px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{followUp.content}</p>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>후속 기록이 없습니다.</p>
              )}
            </div>

            {/* 첨부 이미지 - 가장 하단 */}
            {activity.images && activity.images.length > 0 && (
              <div style={{ borderTop: '2px solid #e0e0e0', paddingTop: '20px' }}>
                <strong style={{ color: '#7f8c8d', fontSize: '14px' }}>첨부 이미지 ({activity.images.length})</strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
                  {activity.images.map((img, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={img.url}
                        alt={`활동 이미지 ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          border: '1px solid #e0e0e0'
                        }}
                        onClick={() => setViewingImage(img.url)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 이미지 확대 모달 */}
            {viewingImage && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.9)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 2000
                }}
                onClick={() => setViewingImage(null)}
              >
                <img
                  src={viewingImage}
                  alt="확대 이미지"
                  style={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                    objectFit: 'contain'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={() => setViewingImage(null)}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#333'
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={onClose} className="btn-secondary">닫기</button>
            <button
              onClick={() => {
                setEditingActivity(activity);
                onClose();
              }}
              className="btn-primary"
            >
              수정
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ActivityForm = ({ activity, onCancel }) => {
    const [formData, setFormData] = useState(
      activity || { date: new Date().toISOString().slice(0, 10), content: '', images: [] }
    );
    const [uploading, setUploading] = useState(false);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Base64로 이미지 변환
    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    const handleImageSelect = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      setUploading(true);
      const newImages = [];

      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          alert('이미지 파일만 업로드 가능합니다.');
          continue;
        }

        // 이미지 크기 체크 (1MB 이하 권장)
        if (file.size > 1024 * 1024) {
          alert(`${file.name}은(는) 1MB보다 큽니다. 더 작은 이미지를 사용해주세요.`);
          continue;
        }

        try {
          const base64 = await convertToBase64(file);
          newImages.push({ url: base64, name: file.name });
        } catch (error) {
          console.error('이미지 변환 실패:', error);
          alert('이미지 처리에 실패했습니다.');
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
      setUploading(false);
      e.target.value = ''; // 파일 입력 초기화
    };

    const handleRemoveImage = (index) => {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    };

    const handleSubmit = () => {
        const activityToSave = {
          ...formData,
          id: formData.id || generateId(),
          customerId,
          date: formData.date // 날짜만 저장
        };
        handleSave(activityToSave);
    };

    return (
      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>활동 기록</h3>
            <button className="btn-close" onClick={onCancel}>×</button>
          </div>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>활동일 *</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>활동 내용 *</label>
              <textarea name="content" value={formData.content} onChange={handleChange} placeholder="활동 내용을 자유롭게 입력하세요&#10;예: 전화 통화, 매물 3개 제안함"></textarea>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>이미지 첨부</label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                multiple
                onChange={handleImageSelect}
                disabled={uploading}
              />
              {uploading && <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>업로드 중...</p>}

              {formData.images && formData.images.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {formData.images.map((img, index) => (
                    <div key={index} style={{ position: 'relative', width: '100px', height: '100px' }}>
                      <img
                        src={img.url}
                        alt={`첨부 ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          background: 'red',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button onClick={onCancel} className="btn-secondary">취소</button>
            <button onClick={handleSubmit} className="btn-primary" disabled={uploading}>저장</button>
          </div>
        </div>
      </div>
    );
  };

  // viewingActivity가 변경되었을 때 최신 데이터로 업데이트
  const currentViewingActivity = viewingActivity
    ? customerActivities.find(a => a.id === viewingActivity.id)
    : null;

  return (
    <div className="activity-tab">
      {!isAdding && !editingActivity && <button onClick={() => setIsAdding(true)}>+ 활동 추가</button>}
      {isAdding && <ActivityForm onCancel={() => setIsAdding(false)} />}

      {editingActivity ? (
        <ActivityForm activity={editingActivity} onCancel={() => setEditingActivity(null)} />
      ) : customerActivities.length > 0 ? (
        <div onClick={handleCloseContextMenu}>
          <table className="customer-table" style={{ marginTop: '15px' }}>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>활동일</th>
                <th style={{ width: '360px' }}>활동 내용</th>
                <th style={{ width: '720px' }}>후속기록</th>
              </tr>
            </thead>
            <tbody>
              {customerActivities.map(activity => (
                <tr
                  key={activity.id}
                  onContextMenu={(e) => handleContextMenu(e, activity)}
                  style={{ cursor: 'context-menu' }}
                >
                  <td style={{ fontSize: '13px' }}>{formatActivityDate(activity.date)}</td>
                  <td
                    onClick={() => setViewingActivity(activity)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '13px',
                      width: '360px',
                      maxWidth: '360px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={activity.content}
                  >
                    {truncateText(activity.content || '', 30)}
                    {activity.followUps && activity.followUps.length > 0 && (
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: '#7f8c8d' }}>
                        💬{activity.followUps.length}
                      </span>
                    )}
                    {activity.images && activity.images.length > 0 && (
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: '#7f8c8d' }}>
                        📷{activity.images.length}
                      </span>
                    )}
                  </td>
                  <td
                    onClick={() => setViewingActivity(activity)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '13px',
                      width: '720px',
                      maxWidth: '720px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={getLatestFollowUp(activity)}
                  >
                    {truncateText(getLatestFollowUp(activity), 50)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          등록된 활동이 없습니다.
        </div>
      )}

      {currentViewingActivity && <ActivityViewModal activity={currentViewingActivity} onClose={() => setViewingActivity(null)} />}

      {contextMenu.visible && (
        <div style={{ top: contextMenu.y, left: contextMenu.x, position: 'absolute', zIndex: 100, background: 'white', border: '1px solid #ccc', borderRadius: '5px', padding: '5px' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: '5px' }}>
            <li style={{ padding: '8px', cursor: 'pointer' }} onClick={handleEdit}>수정</li>
            <li style={{ padding: '8px', cursor: 'pointer' }} onClick={handleDelete}>삭제</li>
            <li style={{ padding: '8px', cursor: 'pointer' }} onClick={handleCloseContextMenu}>취소</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ActivityTab;
