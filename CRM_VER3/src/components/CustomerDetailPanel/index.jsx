import React, { useState, useEffect } from 'react';
import BasicInfo from './BasicInfo';
import BasicInfoSection from './BasicInfoSection';
import ActivityTab from './ActivityTab';
import MeetingTab from './MeetingTab';
import { STATUSES, PROGRESS_STATUSES } from '../../constants';

const CustomerDetailPanel = ({
    selectedCustomer,
    onClose,
    onEditCustomer,
    onUpdateCustomer,
    onDeleteCustomer,
    activities,
    onSaveActivity,
    onDeleteActivity,
    meetings,
    onSaveMeeting,
    onDeleteMeeting
}) => {
  const [activeTab, setActiveTab] = useState('기본정보');
  const [pendingMeetingProperties, setPendingMeetingProperties] = useState(null);
  const [selectedActivityDetail, setSelectedActivityDetail] = useState(null);
  const [selectedMeetingDetail, setSelectedMeetingDetail] = useState(null);

  const handleOpenActivityDetail = (activity) => {
    setSelectedActivityDetail(activity);
    setActiveTab('활동기록');
  };

  const handleOpenMeetingDetail = (meeting) => {
    setSelectedMeetingDetail(meeting);
    setActiveTab('미팅기록');
  };

  // 고객이 변경될 때마다 탭을 기본정보로 리셋
  useEffect(() => {
    if (selectedCustomer) {
      setActiveTab('기본정보');
      setPendingMeetingProperties(null);
      setSelectedActivityDetail(null);
      setSelectedMeetingDetail(null);
    }
  }, [selectedCustomer?.id]);

  const isOpen = !!selectedCustomer;

  // 상태 변경 핸들러
  const handleStatusChange = (status) => {
    const updatedCustomer = {
      ...selectedCustomer,
      status,
      progress: status === '보류' ? null : selectedCustomer.progress
    };
    onUpdateCustomer(updatedCustomer);
  };

  // 진행상황 변경 핸들러
  const handleProgressChange = (progress) => {
    const updatedCustomer = {
      ...selectedCustomer,
      progress
    };
    onUpdateCustomer(updatedCustomer);
  };

  return (
    <aside className={`detail-panel ${isOpen ? 'open' : ''}`}>
      {isOpen && (
        <>
          <div className="panel-header">
            <div>
                <h3>고객 상세</h3>
                <span className="created-date">접수일자: {new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCustomer(selectedCustomer);
                  }}
                  className="btn-primary"
                  style={{ padding: '8px 16px' }}
                >
                  수정
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCustomer(selectedCustomer);
                  }}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  삭제
                </button>
                <button onClick={onClose} className="btn-close">✕</button>
            </div>
          </div>

          {/* 상태 및 진행상황 선택 */}
          <div style={{ padding: '15px', borderBottom: '1px solid #e0e0e0', backgroundColor: '#f8f9fa' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ fontSize: '14px', marginBottom: 0, minWidth: '60px', fontWeight: 'bold' }}>상태</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {STATUSES.map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusChange(status)}
                      style={{
                        fontSize: '13px',
                        padding: '5px 12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        backgroundColor: selectedCustomer.status === status ? '#4CAF50' : 'white',
                        color: selectedCustomer.status === status ? 'white' : '#333',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              {(selectedCustomer.status === '신규' || selectedCustomer.status === '진행중') && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label style={{ fontSize: '14px', marginBottom: 0, minWidth: '60px', fontWeight: 'bold' }}>진행상황</label>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {PROGRESS_STATUSES.map(progress => (
                      <button
                        key={progress}
                        type="button"
                        onClick={() => handleProgressChange(progress)}
                        style={{
                          fontSize: '13px',
                          padding: '5px 12px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          backgroundColor: selectedCustomer.progress === progress ? '#2196F3' : 'white',
                          color: selectedCustomer.progress === progress ? 'white' : '#333',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {progress}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="panel-content">
            <div style={{
              display: 'flex',
              gap: '4px',
              padding: '12px 15px',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px',
              marginBottom: '15px',
              border: '1px solid #bbdefb'
            }}>
              {['기본정보', '활동기록', '미팅기록'].map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: '700',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: activeTab === tab ? 'white' : 'transparent',
                    color: '#1a1a1a',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: activeTab === tab ? '0 2px 8px rgba(33, 150, 243, 0.15)' : 'none',
                    border: activeTab === tab ? '1px solid #e0e0e0' : '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab) {
                      e.target.style.backgroundColor = '#f9f9f9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="tab-content">
              {activeTab === '기본정보' && (
                <>
                  <BasicInfoSection customer={selectedCustomer} onUpdateCustomer={onUpdateCustomer} />
                  <BasicInfo
                    customer={selectedCustomer}
                    onUpdateCustomer={onUpdateCustomer}
                    activities={activities}
                    meetings={meetings}
                    onTabChange={setActiveTab}
                    onOpenActivityDetail={handleOpenActivityDetail}
                    onOpenMeetingDetail={handleOpenMeetingDetail}
                  />
                </>
              )}
              {activeTab === '활동기록' &&
                <ActivityTab
                    customerId={selectedCustomer.id}
                    activities={activities}
                    onSaveActivity={onSaveActivity}
                    onDeleteActivity={onDeleteActivity}
                    selectedActivityId={selectedActivityDetail?.id}
                />}
              {activeTab === '미팅기록' &&
                <MeetingTab
                    customerId={selectedCustomer.id}
                    customerName={selectedCustomer.name}
                    meetings={meetings}
                    onSaveMeeting={onSaveMeeting}
                    onDeleteMeeting={onDeleteMeeting}
                    initialProperties={pendingMeetingProperties}
                    onClearInitialProperties={() => setPendingMeetingProperties(null)}
                    selectedMeetingId={selectedMeetingDetail?.id}
                />}
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

export default CustomerDetailPanel;
