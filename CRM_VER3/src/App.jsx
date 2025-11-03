import React, { useState, useEffect, useRef } from 'react';
import FilterSidebar from './components/FilterSidebar';
import CustomerTable from './components/CustomerTable';
import PropertyTable from './components/PropertyTable';
import CustomerModal from './components/CustomerModal';
import PropertyModal from './components/PropertyModal';
import CustomerDetailPanel from './components/CustomerDetailPanel';
import PropertyDetailPanel from './components/PropertyDetailPanel';
import {
  subscribeToCustomers,
  subscribeToActivities,
  subscribeToMeetings,
  subscribeToPropertySelections,
  subscribeToProperties,
  saveCustomer,
  deleteCustomer,
  saveActivity,
  deleteActivity,
  saveMeeting,
  deleteMeeting,
  savePropertySelection,
  deletePropertySelection,
  saveProperty,
  deleteProperty
} from './utils/storage';

// Mock data for initial setup
const initialCustomers = [
  {
    id: '_1', name: '홍길동', phone: '010-1234-5678', source: '블로그', propertyType: '월세',
    preferredArea: '강남구 역삼동', hopefulDeposit: 1000, hopefulMonthlyRent: 50,
    moveInDate: '2024-08-01', memo: '빠른 입주 희망', status: '신규', createdAt: new Date().toISOString(),
  },
  {
    id: '_2', name: '김철수', phone: '010-9876-5432', source: '네이버광고', propertyType: '전세',
    preferredArea: '서초구 서초동', hopefulDeposit: 5000, hopefulMonthlyRent: 0,
    moveInDate: '2024-09-15', memo: '조용한 집 선호', status: '상담중', createdAt: new Date().toISOString(),
  },
    {
    id: '_3', name: '이영희', phone: '010-1111-2222', source: '지인소개', propertyType: '매매',
    preferredArea: '송파구 잠실동', hopefulDeposit: 10000, hopefulMonthlyRent: 0,
    moveInDate: '2025-01-10', memo: '한강뷰 원함', status: '계약완료', createdAt: new Date().toISOString(),
  }
];

function App() {
  const [customers, setCustomers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [propertySelections, setPropertySelections] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [activeCustomerFilter, setActiveCustomerFilter] = useState('전체');
  const [activePropertyFilter, setActivePropertyFilter] = useState('전체');
  const [activeProgressFilter, setActiveProgressFilter] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('고객목록'); // '고객목록' 또는 '매물장'
  const restoreInputRef = useRef(null);

  useEffect(() => {
    // Realtime subscriptions for Firestore
    const unsubscribeCustomers = subscribeToCustomers((customers) => {
      setCustomers(customers);
    });

    const unsubscribeActivities = subscribeToActivities((activities) => {
      setActivities(activities);
    });

    const unsubscribeMeetings = subscribeToMeetings((meetings) => {
      setMeetings(meetings);
    });

    const unsubscribePropertySelections = subscribeToPropertySelections((propertySelections) => {
      setPropertySelections(propertySelections);
    });

    const unsubscribeProperties = subscribeToProperties((properties) => {
      setProperties(properties);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeCustomers();
      unsubscribeActivities();
      unsubscribeMeetings();
      unsubscribePropertySelections();
      unsubscribeProperties();
    };
  }, []);

  // 과거 미팅이 있는 고객을 자동으로 진행중으로 변경
  useEffect(() => {
    if (customers.length === 0 || meetings.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    customers.forEach(customer => {
      const customerMeetings = meetings.filter(m => m.customerId === customer.id);
      const hasPastMeeting = customerMeetings.some(m => {
        const meetingDate = new Date(m.date);
        meetingDate.setHours(0, 0, 0, 0);
        return meetingDate < today;
      });

      if (hasPastMeeting && customer.status === '신규') {
        saveCustomer({ ...customer, status: '진행중' });
      }
    });
  }, [customers, meetings]);

  const handleFilterChange = (filter) => {
    if (activeTab === '고객목록') {
      setActiveCustomerFilter(filter);
      setActiveProgressFilter(null); // 상태 변경 시 진행상황 필터 초기화
    } else {
      setActivePropertyFilter(filter);
    }
  };

  const handleProgressFilterChange = (progress) => {
    setActiveProgressFilter(progress);
  };

  const handleSelectCustomer = (customer) => {
    // 이미 선택된 고객을 다시 클릭하면 패널 닫기 (토글)
    if (selectedCustomerId === customer.id) {
      setSelectedCustomerId(null);
    } else {
      setSelectedCustomerId(customer.id);
    }
  };

  const handleOpenModal = (customer = null) => {
      setEditingCustomer(customer);
      setIsModalOpen(true);
      // 모바일에서 detail panel 닫기
      if (customer && customer.id === selectedCustomerId) {
        setSelectedCustomerId(null);
      }
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingCustomer(null);
  };

  const handleSaveCustomer = async (customerData) => {
    await saveCustomer(customerData);
    // Firestore 실시간 구독이 자동으로 state 업데이트
  };

  const handleFavoriteCustomer = async (customer) => {
    const updatedCustomer = {
      ...customer,
      isFavorite: !customer.isFavorite
    };
    await saveCustomer(updatedCustomer);
  };

  const handleDeleteCustomer = async (customer) => {
    if (confirm(`"${customer.name}" 고객을 정말 삭제하시겠습니까?`)) {
      await deleteCustomer(customer.id);
      if (selectedCustomerId === customer.id) {
        setSelectedCustomerId(null);
      }
    }
  };

  const handleSaveActivity = async (activityData) => {
    await saveActivity(activityData);
  };

  const handleDeleteActivity = async (activityId) => {
    if (confirm('정말 이 활동을 삭제하시겠습니까?')) {
      await deleteActivity(activityId);
    }
  };

  const handleSaveMeeting = async (meetingData) => {
    await saveMeeting(meetingData);
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (confirm('정말 이 미팅을 삭제하시겠습니까?')) {
      await deleteMeeting(meetingId);
    }
  };

  const handleSavePropertySelection = async (propertySelectionData) => {
    await savePropertySelection(propertySelectionData);
  };

  const handleDeletePropertySelection = async (propertySelectionId) => {
    if (confirm('정말 이 매물선정을 삭제하시겠습니까?')) {
      await deletePropertySelection(propertySelectionId);
    }
  };

  const handleSelectProperty = (property) => {
    // 이미 선택된 매물을 다시 클릭하면 패널 닫기 (토글)
    if (selectedPropertyId === property.id) {
      setSelectedPropertyId(null);
    } else {
      setSelectedPropertyId(property.id);
    }
  };

  const handleOpenPropertyModal = (property = null) => {
    setEditingProperty(property);
    setIsPropertyModalOpen(true);
    // 모바일에서 detail panel 닫기
    if (property && property.id === selectedPropertyId) {
      setSelectedPropertyId(null);
    }
  };

  const handleClosePropertyModal = () => {
    setIsPropertyModalOpen(false);
    setEditingProperty(null);
  };

  const handleSaveProperty = async (propertyData) => {
    await saveProperty(propertyData);
  };

  const handleDeleteProperty = async (property) => {
    if (confirm(`"${property.buildingName}" 매물을 정말 삭제하시겠습니까?`)) {
      await deleteProperty(property.id);
      if (selectedPropertyId === property.id) {
        setSelectedPropertyId(null);
      }
    }
  };

  const handleBackup = () => {
    const backupData = {
        customers,
        activities,
        meetings,
        propertySelections,
        properties,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestore = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data && Array.isArray(data.customers) && Array.isArray(data.activities)) {
          // Firestore에 각 문서 저장
          const { saveCustomers, saveActivities, saveMeetings, savePropertySelections, saveProperties } = await import('./utils/storage');
          await saveCustomers(data.customers || []);
          await saveActivities(data.activities || []);
          await saveMeetings(data.meetings || []);
          await savePropertySelections(data.propertySelections || []);
          await saveProperties(data.properties || []);
          alert('데이터가 성공적으로 복원되었습니다.');
        } else {
          throw new Error('잘못된 파일 형식입니다.');
        }
      } catch (error) {
        alert(`복원 실패: ${error.message}`);
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  const getLastActivityDate = (customerId) => {
    const customerActivities = activities.filter(a => a.customerId === customerId);
    if (customerActivities.length === 0) return null;
    const sorted = customerActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    return new Date(sorted[0].date);
  };

  const getDaysDiff = (date1, date2) => {
    const diff = Math.abs(date1 - date2);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // 필터 설명 함수
  const getFilterDescription = (filter) => {
    const descriptions = {
      '전체': '등록된 모든 고객을 표시합니다',
      '신규': '상태가 신규로 설정된 고객들을 표시합니다',
      '진행중': '상태가 진행중으로 설정된 고객들을 표시합니다',
      '장기관리고객': '장기적으로 관리 중인 고객들을 표시합니다',
      '보류': '상태가 보류로 설정된 고객들을 표시합니다',
      '집중고객': '즐겨찾기로 표시된 고객들을 집중적으로 관리하기 위해 표시합니다',
      '오늘미팅': '오늘 일정이 확정된 미팅이 있는 고객들을 표시합니다',
      '미팅일확정': '오늘 이후로 미팅이 예정된 고객들을 표시합니다',
      '오늘연락': '오늘 활동 기록(전화, 문자, 방문 등)이 있는 고객들을 표시합니다',
      '어제연락': '어제 활동 기록(전화, 문자, 방문 등)이 있는 고객들을 표시합니다',
      '연락할고객': '어제와 오늘 모두 활동 기록이 없는 고객들입니다 (보류 상태 제외). 마지막 연락일이 오래된 순으로 정렬됩니다'
    };
    return descriptions[filter] || '';
  };

  const filteredCustomers = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = customers.filter(customer => {
      // 집중고객 필터
      if (activeCustomerFilter === '집중고객') {
        return customer.isFavorite;
      }

      // 장기관리고객 필터
      if (activeCustomerFilter === '장기관리고객') {
        return customer.status === '장기관리고객';
      }

      // 오늘미팅 필터
      if (activeCustomerFilter === '오늘미팅') {
        const customerMeetings = meetings.filter(m => m.customerId === customer.id);
        return customerMeetings.some(m => {
          const meetingDate = new Date(m.date);
          meetingDate.setHours(0, 0, 0, 0);
          return meetingDate.getTime() === today.getTime();
        });
      }

      // 미팅일확정 필터
      if (activeCustomerFilter === '미팅일확정') {
        const customerMeetings = meetings.filter(m => m.customerId === customer.id);
        return customerMeetings.some(m => {
          const meetingDate = new Date(m.date);
          meetingDate.setHours(0, 0, 0, 0);
          return meetingDate > today;
        });
      }

      // 오늘연락 필터
      if (activeCustomerFilter === '오늘연락') {
        const customerActivities = activities.filter(a => a.customerId === customer.id);
        return customerActivities.some(a => {
          const activityDate = new Date(a.date);
          activityDate.setHours(0, 0, 0, 0);
          return activityDate.getTime() === today.getTime();
        });
      }

      // 어제연락 필터
      if (activeCustomerFilter === '어제연락') {
        const customerActivities = activities.filter(a => a.customerId === customer.id);
        return customerActivities.some(a => {
          const activityDate = new Date(a.date);
          activityDate.setHours(0, 0, 0, 0);
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return activityDate.getTime() === yesterday.getTime();
        });
      }

      // 연락할고객 필터 (어제, 오늘 활동 기록 없음, 보류 상태 제외)
      if (activeCustomerFilter === '연락할고객') {
        if (customer.status === '보류') return false;
        const customerActivities = activities.filter(a => a.customerId === customer.id);
        const today2 = new Date(today);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        return !customerActivities.some(a => {
          const activityDate = new Date(a.date);
          activityDate.setHours(0, 0, 0, 0);
          return activityDate.getTime() === today2.getTime() || activityDate.getTime() === yesterday.getTime();
        });
      }

      // 답장대기 필터
      if (activeCustomerFilter === '답장대기') {
        const customerActivities = activities.filter(a => a.customerId === customer.id);
        if (customerActivities.length === 0) return false;

        return customerActivities.some(activity => {
          const followUps = activity.followUps || [];
          return !followUps.some(followUp => followUp.author === '답장');
        });
      }

      // 기존 상태 필터
      const statusMatch = activeCustomerFilter === '전체' || customer.status === activeCustomerFilter;
      const progressMatch = !activeProgressFilter || customer.progress === activeProgressFilter;
      return statusMatch && progressMatch;
    });

    // 정렬 로직
    if (activeCustomerFilter === '오늘미팅') {
      // 오늘미팅 필터: 오늘 미팅 시간순 정렬
      filtered.sort((a, b) => {
        const aMeetings = meetings.filter(m => {
          const meetingDate = new Date(m.date);
          meetingDate.setHours(0, 0, 0, 0);
          return m.customerId === a.id && meetingDate.getTime() === today.getTime();
        });
        const bMeetings = meetings.filter(m => {
          const meetingDate = new Date(m.date);
          meetingDate.setHours(0, 0, 0, 0);
          return m.customerId === b.id && meetingDate.getTime() === today.getTime();
        });

        if (aMeetings.length === 0) return 1;
        if (bMeetings.length === 0) return -1;

        const aTime = new Date(aMeetings[0].date).getTime();
        const bTime = new Date(bMeetings[0].date).getTime();
        return aTime - bTime;
      });
    } else if (activeCustomerFilter === '미팅일확정') {
      // 미팅일확정 필터: 가장 가까운 미팅 날짜순 정렬
      filtered.sort((a, b) => {
        const aMeetings = meetings.filter(m => {
          const meetingDate = new Date(m.date);
          meetingDate.setHours(0, 0, 0, 0);
          return m.customerId === a.id && meetingDate > today;
        });
        const bMeetings = meetings.filter(m => {
          const meetingDate = new Date(m.date);
          meetingDate.setHours(0, 0, 0, 0);
          return m.customerId === b.id && meetingDate > today;
        });

        if (aMeetings.length === 0) return 1;
        if (bMeetings.length === 0) return -1;

        const aNextMeeting = aMeetings.sort((m1, m2) => new Date(m1.date) - new Date(m2.date))[0];
        const bNextMeeting = bMeetings.sort((m1, m2) => new Date(m1.date) - new Date(m2.date))[0];

        return new Date(aNextMeeting.date) - new Date(bNextMeeting.date);
      });
    } else if (activeCustomerFilter === '오늘연락') {
      // 오늘연락 필터: 활동 시간순 정렬
      filtered.sort((a, b) => {
        const aActivities = activities.filter(act => act.customerId === a.id && new Date(act.date).toDateString() === today.toDateString());
        const bActivities = activities.filter(act => act.customerId === b.id && new Date(act.date).toDateString() === today.toDateString());

        if (aActivities.length === 0) return 1;
        if (bActivities.length === 0) return -1;

        const aLatestActivity = aActivities.sort((act1, act2) => new Date(act2.date) - new Date(act1.date))[0];
        const bLatestActivity = bActivities.sort((act1, act2) => new Date(act2.date) - new Date(act1.date))[0];

        return new Date(bLatestActivity.date) - new Date(aLatestActivity.date);
      });
    } else if (activeCustomerFilter === '어제연락') {
      // 어제연락 필터: 어제 활동 시간순 정렬
      filtered.sort((a, b) => {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const aActivities = activities.filter(act => act.customerId === a.id && new Date(act.date).toDateString() === yesterday.toDateString());
        const bActivities = activities.filter(act => act.customerId === b.id && new Date(act.date).toDateString() === yesterday.toDateString());

        if (aActivities.length === 0) return 1;
        if (bActivities.length === 0) return -1;

        const aLatestActivity = aActivities.sort((act1, act2) => new Date(act2.date) - new Date(act1.date))[0];
        const bLatestActivity = bActivities.sort((act1, act2) => new Date(act2.date) - new Date(act1.date))[0];

        return new Date(bLatestActivity.date) - new Date(aLatestActivity.date);
      });
    } else if (activeCustomerFilter === '연락할고객') {
      // 연락할고객 필터: 마지막 활동일이 오래된 순 정렬
      filtered.sort((a, b) => {
        const aLastActivity = getLastActivityDate(a.id);
        const bLastActivity = getLastActivityDate(b.id);
        if (!aLastActivity) return 1;
        if (!bLastActivity) return -1;
        return aLastActivity - bLastActivity;
      });
    }

    return filtered;
  })();

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      {/* 모바일 오버레이 배경 */}
      {isMobileSidebarOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* 상단 콘텐츠 영역 (사이드바 + 메인콘텐츠) */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <FilterSidebar
          activeTab={activeTab}
          activeFilter={activeTab === '고객목록' ? activeCustomerFilter : activePropertyFilter}
          onFilterChange={handleFilterChange}
          customers={customers}
          meetings={meetings}
          activities={activities}
          properties={properties}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <header className="main-header">
            <button className="hamburger-btn" onClick={() => setIsMobileSidebarOpen(true)}>
              ☰
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h1>{activeTab === '고객목록' ? '고객 목록' : '매물장'}</h1>
              {activeTab === '고객목록' && activeCustomerFilter !== '전체' && (
                <span style={{ fontSize: '13px', color: '#7f8c8d' }}>
                  필터: {activeCustomerFilter} - {getFilterDescription(activeCustomerFilter)}
                </span>
              )}
            </div>
            <div className="header-actions">
              {activeTab === '고객목록' ? (
                <>
                  <button onClick={() => handleOpenModal()} className="btn-primary">+ 고객 추가</button>
                  <button onClick={handleBackup} className="btn-secondary">백업</button>
                  <button onClick={() => restoreInputRef.current?.click()} className="btn-secondary">복원</button>
                  <input type="file" ref={restoreInputRef} onChange={handleRestore} style={{ display: 'none' }} accept=".json"/>
                </>
              ) : (
                <>
                  <button onClick={() => handleOpenPropertyModal()} className="btn-primary">+ 매물 추가</button>
                  <button onClick={handleBackup} className="btn-secondary">백업</button>
                  <button onClick={() => restoreInputRef.current?.click()} className="btn-secondary">복원</button>
                  <input type="file" ref={restoreInputRef} onChange={handleRestore} style={{ display: 'none' }} accept=".json"/>
                </>
              )}
            </div>
          </header>
          <main className="table-container" style={{ flex: 1, overflow: 'auto' }}>
            {activeTab === '고객목록' ? (
              <CustomerTable
                customers={filteredCustomers}
                onSelectCustomer={handleSelectCustomer}
                onEdit={handleOpenModal}
                onDelete={handleDeleteCustomer}
                selectedCustomerId={selectedCustomerId}
                activeFilter={activeCustomerFilter}
                activeProgressFilter={activeProgressFilter}
                onProgressFilterChange={handleProgressFilterChange}
                allCustomers={customers}
                onFavoriteCustomer={handleFavoriteCustomer}
                activities={activities}
                meetings={meetings}
              />
            ) : (
              <PropertyTable
                properties={properties}
                onSelectProperty={handleSelectProperty}
                onEdit={handleOpenPropertyModal}
                onDelete={handleDeleteProperty}
                selectedPropertyId={selectedPropertyId}
              />
            )}
          </main>
        </div>
      </div>

      {/* 하단 탭바 */}
      <div className="tab-bar" style={{
        display: 'flex',
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#fff',
        height: '60px',
        justifyContent: 'center',
        gap: '40px',
        alignItems: 'center'
      }}>
        <button
          onClick={() => setActiveTab('고객목록')}
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            fontWeight: activeTab === '고객목록' ? 'bold' : 'normal',
            color: activeTab === '고객목록' ? '#2196F3' : '#999',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: activeTab === '고객목록' ? '3px solid #2196F3' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          📋 고객목록
        </button>
        <button
          onClick={() => setActiveTab('매물장')}
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            fontWeight: activeTab === '매물장' ? 'bold' : 'normal',
            color: activeTab === '매물장' ? '#2196F3' : '#999',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: activeTab === '매물장' ? '3px solid #2196F3' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          🏠 매물장
        </button>
      </div>

      {activeTab === '고객목록' && (
        <>
          <CustomerDetailPanel
            selectedCustomer={selectedCustomer}
            onClose={() => setSelectedCustomerId(null)}
            onEditCustomer={handleOpenModal}
            onUpdateCustomer={handleSaveCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            activities={activities}
            onSaveActivity={handleSaveActivity}
            onDeleteActivity={handleDeleteActivity}
            meetings={meetings}
            onSaveMeeting={handleSaveMeeting}
            onDeleteMeeting={handleDeleteMeeting}
            propertySelections={propertySelections}
            onSavePropertySelection={handleSavePropertySelection}
            onDeletePropertySelection={handleDeletePropertySelection}
          />

          <CustomerModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveCustomer}
            editData={editingCustomer}
          />
        </>
      )}

      {activeTab === '매물장' && (
        <>
          {/* PropertyDetailPanel */}
          <PropertyDetailPanel
            selectedProperty={selectedProperty}
            onClose={() => setSelectedPropertyId(null)}
            onEditProperty={handleOpenPropertyModal}
            onUpdateProperty={handleSaveProperty}
            onDeleteProperty={handleDeleteProperty}
          />

          {/* PropertyModal */}
          <PropertyModal
            isOpen={isPropertyModalOpen}
            onClose={handleClosePropertyModal}
            onSave={handleSaveProperty}
            editData={editingProperty}
          />
        </>
      )}
    </div>
  );
}

export default App;
