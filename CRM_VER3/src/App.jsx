import React, { useState, useEffect, useRef } from 'react';
import FilterSidebar from './components/FilterSidebar';
import Dashboard from './components/Dashboard';
import CustomerTable from './components/CustomerTable';
import PropertyTable from './components/PropertyTable';
import BuildingTable from './components/BuildingTable';
import ContractTable from './components/ContractTable';
import CustomerModal from './components/CustomerModal';
import PropertyModal from './components/PropertyModal';
import BuildingModal from './components/BuildingModal';
import ContractModal from './components/ContractModal';
import CustomerDetailPanel from './components/CustomerDetailPanel';
import PropertyDetailPanel from './components/PropertyDetailPanel';
import BuildingDetailPanel from './components/BuildingDetailPanel';
import ContractDetailPanel from './components/ContractDetailPanel';
import PropertyImporter from './components/PropertyImporter';
import BuildingImporter from './components/BuildingImporter';
import ContractImporter from './components/ContractImporter';
import DynamicTableView from './components/DynamicTable/DynamicTableView';
import TableCreator from './components/DynamicTable/TableCreator';
import DynamicCSVImporter from './components/DynamicTable/DynamicCSVImporter';
import DynamicRowModal from './components/DynamicTable/DynamicRowModal';
import BookmarkBar from './components/BookmarkBar/BookmarkBar';
import BookmarkModal from './components/BookmarkBar/BookmarkModal';
import {
  subscribeToCustomers,
  subscribeToActivities,
  subscribeToMeetings,
  subscribeToPropertySelections,
  subscribeToProperties,
  subscribeToBuildings,
  subscribeToContracts,
  saveCustomer,
  deleteCustomer,
  saveActivity,
  deleteActivity,
  saveMeeting,
  deleteMeeting,
  savePropertySelection,
  deletePropertySelection,
  saveProperty,
  deleteProperty,
  saveProperties,
  saveBuilding,
  deleteBuilding,
  saveBuildings,
  saveContract,
  saveContracts,
  deleteContract,
  removeDuplicateBuildings,
  subscribeToBookmarks,
  saveBookmark,
  deleteBookmark
} from './utils/storage';
import {
  subscribeToTables,
  saveTable,
  deleteTable,
  subscribeToTableData,
  saveTableRow,
  saveTableRows,
  deleteTableRow,
  updateTableColumnRequired
} from './utils/dynamicTableStorage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/config';

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
  const [buildings, setBuildings] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [activeCustomerFilter, setActiveCustomerFilter] = useState('전체');
  const [activeContractFilter, setActiveContractFilter] = useState('전체');
  const [activeDashboardFilter, setActiveDashboardFilter] = useState('고객관리');
  const [activeProgressFilter, setActiveProgressFilter] = useState(null);
  const [dynamicTableFilters, setDynamicTableFilters] = useState({}); // { tableId: filterValue }
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('대시보드'); // '대시보드', '계약호실', '고객관리', '매물장', '건물정보'
  const [isPropertyImporterOpen, setIsPropertyImporterOpen] = useState(false);
  const [isBuildingImporterOpen, setIsBuildingImporterOpen] = useState(false);
  const [isContractImporterOpen, setIsContractImporterOpen] = useState(false);
  const [dynamicTables, setDynamicTables] = useState([]);
  const [dynamicTableData, setDynamicTableData] = useState({}); // { tableId: [rows] }
  const [selectedDynamicTableId, setSelectedDynamicTableId] = useState(null);
  const [selectedDynamicRowId, setSelectedDynamicRowId] = useState(null);
  const [isTableCreatorOpen, setIsTableCreatorOpen] = useState(false);
  const [isCSVImporterOpen, setIsCSVImporterOpen] = useState(false);
  const [isDynamicRowModalOpen, setIsDynamicRowModalOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [selectedBookmarkSection, setSelectedBookmarkSection] = useState(1);
  const restoreInputRef = useRef(null);
  const dynamicTableUnsubscribes = useRef({});
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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

    const unsubscribeBuildings = subscribeToBuildings((buildings) => {
      setBuildings(buildings);
    });

    const unsubscribeContracts = subscribeToContracts((contracts) => {
      setContracts(contracts);
    });

    const unsubscribeBookmarks = subscribeToBookmarks((bookmarks) => {
      setBookmarks(bookmarks);
    });

    // 동적 테이블 메타데이터 구독
    const unsubscribeTables = subscribeToTables((tables) => {
      setDynamicTables(tables);

      // 각 테이블의 데이터 구독 설정 및 마이그레이션
      tables.forEach(table => {
        // 마이그레이션: 제목과 내용 컬럼의 required를 false로 변경
        if (table.columns) {
          const titleColumn = table.columns.find(col =>
            col.name === '제목' || col.name === 'title' || col.label === '제목'
          );
          const contentColumn = table.columns.find(col =>
            col.name === '내용' || col.name === 'content' || col.label === '내용'
          );

          // 제목 컬럼의 required가 true이면 false로 변경
          if (titleColumn && titleColumn.required === true) {
            updateTableColumnRequired(table.id, titleColumn.name, false).catch(err =>
              console.log('제목 컬럼 업데이트 실패:', err)
            );
          }

          // 내용 컬럼의 required가 true이면 false로 변경
          if (contentColumn && contentColumn.required === true) {
            updateTableColumnRequired(table.id, contentColumn.name, false).catch(err =>
              console.log('내용 컬럼 업데이트 실패:', err)
            );
          }

          // 마이그레이션: 일지 테이블 컬럼 순서 및 가시성 조정
          if (table.name?.includes('일지') || table.name?.includes('journal')) {
            const updatedColumns = table.columns.map(col => {
              const colName = col.name;
              const colLabel = col.label || '';

              // 표시할 컬럼: 기록일, 제목, 내용만 display: true
              if (colName === '기록일' || colLabel === '기록일' ||
                  colName === '제목' || colLabel === '제목' ||
                  colName === '내용' || colLabel === '내용') {
                return { ...col, display: true };
              }

              // 나머지 컬럼은 숨김
              return { ...col, display: false };
            });

            // 컬럼 순서 재정렬: 기록일 → 제목 → 내용
            const reorderedColumns = [];
            const 기록일Col = updatedColumns.find(col =>
              col.name === '기록일' || col.label === '기록일'
            );
            const 제목Col = updatedColumns.find(col =>
              col.name === '제목' || col.label === '제목'
            );
            const 내용Col = updatedColumns.find(col =>
              col.name === '내용' || col.label === '내용'
            );

            if (기록일Col) reorderedColumns.push(기록일Col);
            if (제목Col) reorderedColumns.push(제목Col);
            if (내용Col) reorderedColumns.push(내용Col);

            // 나머지 컬럼 추가 (display: false 상태)
            updatedColumns.forEach(col => {
              if (col !== 기록일Col && col !== 제목Col && col !== 내용Col) {
                reorderedColumns.push(col);
              }
            });

            // Firestore 업데이트
            const tableRef = doc(db, 'tables', table.id);
            updateDoc(tableRef, { columns: reorderedColumns }).catch(err =>
              console.log('일지 테이블 컬럼 재배치 실패:', err)
            );
          }
        }

        // 기존 구독 해제
        if (dynamicTableUnsubscribes.current[table.id]) {
          dynamicTableUnsubscribes.current[table.id]();
        }

        // 새로운 구독 설정
        dynamicTableUnsubscribes.current[table.id] = subscribeToTableData(table.id, (data) => {
          setDynamicTableData(prev => ({
            ...prev,
            [table.id]: data
          }));
        });
      });
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeCustomers();
      unsubscribeActivities();
      unsubscribeMeetings();
      unsubscribePropertySelections();
      unsubscribeProperties();
      unsubscribeBuildings();
      unsubscribeContracts();
      unsubscribeBookmarks();
      unsubscribeTables();

      // 동적 테이블 데이터 구독 모두 해제
      Object.values(dynamicTableUnsubscribes.current).forEach(unsub => {
        if (unsub) unsub();
      });
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

  // 계약호실 진행상황 자동 변경
  // 계약서작성일 다음날 → 잔금, 잔금일 다음날 → 입주완료
  useEffect(() => {
    if (contracts.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    contracts.forEach(contract => {
      let newProgressStatus = null;

      // 잔금일이 지났는지 확인 (잔금일 다음날부터 입주완료로 변경)
      if (contract.balanceDate && contract.progressStatus !== '입주완료') {
        const balanceDate = new Date(contract.balanceDate);
        balanceDate.setHours(0, 0, 0, 0);
        const nextDayAfterBalance = new Date(balanceDate);
        nextDayAfterBalance.setDate(nextDayAfterBalance.getDate() + 1);

        if (today >= nextDayAfterBalance) {
          newProgressStatus = '입주완료';
        }
      }

      // 계약서작성일이 지났는지 확인 (계약서작성일 다음날부터 잔금으로 변경)
      if (!newProgressStatus && contract.contractDate && contract.progressStatus !== '잔금' && contract.progressStatus !== '입주완료') {
        const contractDate = new Date(contract.contractDate);
        contractDate.setHours(0, 0, 0, 0);
        const nextDayAfterContract = new Date(contractDate);
        nextDayAfterContract.setDate(nextDayAfterContract.getDate() + 1);

        if (today >= nextDayAfterContract) {
          newProgressStatus = '잔금';
        }
      }

      // 진행상황이 변경되어야 하는 경우
      if (newProgressStatus && contract.progressStatus !== newProgressStatus) {
        saveContract({ ...contract, progressStatus: newProgressStatus });
      }
    });
  }, [contracts]);

  const handleFilterChange = (filter) => {
    // 동적 테이블 필터
    if (dynamicTables && dynamicTables.some(t => t.id === activeTab)) {
      setDynamicTableFilters(prev => ({
        ...prev,
        [activeTab]: filter
      }));
    } else if (activeTab === '고객관리') {
      setActiveCustomerFilter(filter);
      setActiveProgressFilter(null); // 상태 변경 시 진행상황 필터 초기화
    } else if (activeTab === '매물장') {
      setActivePropertyFilter(filter);
    } else if (activeTab === '건물정보') {
      setActiveBuildingFilter(filter);
    } else if (activeTab === '계약호실') {
      setActiveContractFilter(filter);
    } else if (activeTab === '대시보드') {
      setActiveDashboardFilter(filter); // 현재는 고객관리 필터만 사용
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
    if (confirm('정말 이 미팅매물준비를 삭제하시겠습니까?')) {
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

  // Building handlers
  const handleSelectBuilding = (building) => {
    if (selectedBuildingId === building.id) {
      setSelectedBuildingId(null);
    } else {
      setSelectedBuildingId(building.id);
    }
  };

  const handleOpenBuildingModal = (building = null) => {
    setEditingBuilding(building);
    setIsBuildingModalOpen(true);
    if (building && building.id === selectedBuildingId) {
      setSelectedBuildingId(null);
    }
  };

  const handleCloseBuildingModal = () => {
    setIsBuildingModalOpen(false);
    setEditingBuilding(null);
  };

  const handleSaveBuilding = async (buildingData) => {
    await saveBuilding(buildingData);
  };

  const handleDeleteBuilding = async (building) => {
    if (confirm(`"${building.name}" 건물을 정말 삭제하시겠습니까?`)) {
      await deleteBuilding(building.id);
      if (selectedBuildingId === building.id) {
        setSelectedBuildingId(null);
      }
    }
  };

  // Contract handlers
  const handleSelectContract = (contract) => {
    if (selectedContractId === contract.id) {
      setSelectedContractId(null);
    } else {
      setSelectedContractId(contract.id);
    }
  };

  const handleOpenContractModal = (contract = null) => {
    setEditingContract(contract);
    setIsContractModalOpen(true);
    if (contract && contract.id === selectedContractId) {
      setSelectedContractId(null);
    }
  };

  const handleCloseContractModal = () => {
    setIsContractModalOpen(false);
    setEditingContract(null);
  };

  // 상세패널 닫기 핸들러 (검색창 클릭 시 호출)
  const handleCloseDetailPanel = () => {
    setSelectedCustomerId(null);
    setSelectedPropertyId(null);
    setSelectedBuildingId(null);
    setSelectedContractId(null);
    setSelectedDynamicRowId(null);
  };

  // ========== 동적 테이블 핸들러 ==========

  const handleCreateDynamicTable = async (tableData, mode) => {
    try {
      if (mode === 'manual') {
        // 수동 정의 테이블 생성
        const tableId = await saveTable(tableData);
        setIsTableCreatorOpen(false);
        alert(`"${tableData.name}" 테이블이 생성되었습니다.`);
      } else if (mode === 'csv') {
        // CSV 임포트로 전환
        setIsTableCreatorOpen(false);
        setIsCSVImporterOpen(true);
      }
    } catch (error) {
      alert(`테이블 생성 실패: ${error.message}`);
    }
  };

  const handleImportCSVTable = async (tableData, rowsData) => {
    try {
      // 1. 테이블 메타데이터 저장
      const tableId = await saveTable(tableData);

      // 2. 데이터 행 저장
      await saveTableRows(tableId, rowsData);

      setIsCSVImporterOpen(false);
      alert(`"${tableData.name}" 테이블이 생성되고 ${rowsData.length}개의 행이 임포트되었습니다.`);
    } catch (error) {
      alert(`테이블 임포트 실패: ${error.message}`);
    }
  };

  const handleSelectDynamicRow = (row) => {
    if (selectedDynamicRowId === row.id) {
      setSelectedDynamicRowId(null);
    } else {
      setSelectedDynamicRowId(row.id);
    }
  };

  const handleDeleteDynamicTable = async (tableId) => {
    if (!confirm('이 테이블과 모든 데이터를 삭제하겠습니까?')) {
      return;
    }

    try {
      await deleteTable(tableId);
      setSelectedDynamicTableId(null);
      alert('테이블이 삭제되었습니다.');
    } catch (error) {
      alert(`테이블 삭제 실패: ${error.message}`);
    }
  };

  const handleDeleteDynamicRow = async (row) => {
    if (!confirm('이 행을 삭제하겠습니까?')) {
      return;
    }

    try {
      await deleteTableRow(activeTab, row.id);
      if (selectedDynamicRowId === row.id) {
        setSelectedDynamicRowId(null);
      }
    } catch (error) {
      alert(`행 삭제 실패: ${error.message}`);
    }
  };

  const handleSaveDynamicRow = async (updatedRow) => {
    try {
      await saveTableRow(activeTab, updatedRow);
      // 로컬 상태 업데이트
      setDynamicTableData(prev => ({
        ...prev,
        [activeTab]: (prev[activeTab] || []).map(row =>
          row.id === updatedRow.id ? updatedRow : row
        )
      }));
      alert('저장되었습니다.');
    } catch (error) {
      alert(`행 저장 실패: ${error.message}`);
    }
  };

  const handleAddDynamicRow = async (newRow) => {
    try {
      await saveTableRow(activeTab, newRow);
      // Firestore 실시간 구독이 자동으로 state 업데이트하므로 로컬 상태 업데이트 제거
      setIsDynamicRowModalOpen(false);
      alert('행이 추가되었습니다.');
    } catch (error) {
      alert(`행 추가 실패: ${error.message}`);
    }
  };

  const handleSaveContract = async (contractData) => {
    await saveContract(contractData);
    // 로컬 상태를 즉시 업데이트하여 UI를 빠르게 반영
    setContracts(prevContracts =>
      prevContracts.map(c => c.id === contractData.id ? contractData : c)
    );
  };

  const handleDeleteContract = async (contract) => {
    if (confirm(`"${contract.buildingName} ${contract.roomNumber}" 계약호실을 정말 삭제하시겠습니까?`)) {
      await deleteContract(contract.id);
      if (selectedContractId === contract.id) {
        setSelectedContractId(null);
      }
    }
  };

  const handleImportProperties = async (importedProperties) => {
    try {
      await saveProperties(importedProperties);
      // Firestore 실시간 구독이 자동으로 state 업데이트
    } catch (error) {
      console.error('Error importing properties:', error);
      throw error;
    }
  };

  const handleImportBuildings = async (importedBuildings) => {
    try {
      await saveBuildings(importedBuildings);
      // Firestore 실시간 구독이 자동으로 state 업데이트
    } catch (error) {
      console.error('Error importing buildings:', error);
      throw error;
    }
  };

  const handleImportContracts = async (importedContracts) => {
    try {
      await saveContracts(importedContracts);
      // Firestore 실시간 구독이 자동으로 state 업데이트
    } catch (error) {
      console.error('Error importing contracts:', error);
      throw error;
    }
  };

  const handleRemoveDuplicateBuildings = async () => {
    if (!confirm('중복된 건물 데이터를 정리하시겠습니까?\n(건물명 + 지번이 동일한 데이터 중 더 오래된 것이 삭제됩니다)')) {
      return;
    }

    try {
      const result = await removeDuplicateBuildings();
      alert(`중복 제거 완료!\n제거됨: ${result.removed}개\n유지됨: ${result.kept}개`);
    } catch (error) {
      console.error('Error removing duplicates:', error);
      alert(`중복 제거 실패: ${error.message}`);
    }
  };

  // 북마크 핸들러
  const handleSaveBookmark = async (bookmark) => {
    try {
      await saveBookmark(bookmark);
      // Firestore 실시간 구독이 자동으로 state 업데이트
      setEditingBookmark(null);
      setIsBookmarkModalOpen(false);
    } catch (error) {
      alert(`북마크 저장 실패: ${error.message}`);
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    try {
      await deleteBookmark(bookmarkId);
      // Firestore 실시간 구독이 자동으로 state 업데이트
    } catch (error) {
      alert(`북마크 삭제 실패: ${error.message}`);
    }
  };

  const handleOpenBookmarkModal = (bookmarkOrSection = null) => {
    // bookmarkOrSection이 숫자면 섹션 번호, 객체면 편집 중인 북마크
    if (typeof bookmarkOrSection === 'number') {
      setSelectedBookmarkSection(bookmarkOrSection);
      setEditingBookmark(null);
    } else {
      setEditingBookmark(bookmarkOrSection);
      if (bookmarkOrSection?.section) {
        setSelectedBookmarkSection(bookmarkOrSection.section);
      }
    }
    setIsBookmarkModalOpen(true);
  };

  const handleCloseBookmarkModal = () => {
    setEditingBookmark(null);
    setSelectedBookmarkSection(1);
    setIsBookmarkModalOpen(false);
  };

  const handleBackup = () => {
    const backupData = {
        customers,
        activities,
        meetings,
        propertySelections,
        properties,
        buildings,
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
          const { saveCustomers, saveActivities, saveMeetings, savePropertySelections, saveProperties, saveBuildings } = await import('./utils/storage');
          await saveCustomers(data.customers || []);
          await saveActivities(data.activities || []);
          await saveMeetings(data.meetings || []);
          await savePropertySelections(data.propertySelections || []);
          await saveProperties(data.properties || []);
          await saveBuildings(data.buildings || []);
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

  const getDaysDiff = (date1, date2) => {
    const diff = Math.abs(date1 - date2);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getLastActivityDate = (customerId) => {
    const customerActivities = activities.filter(a => a.customerId === customerId);
    if (customerActivities.length === 0) return null;
    const sorted = customerActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    return new Date(sorted[0].date);
  };

  // 스와이프 제스처 처리 (모바일 테이블 네비게이션)
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // 최소 50px 이상 스와이프

    if (Math.abs(diff) < minSwipeDistance) return; // 너무 짧은 터치 무시

    // 탭 목록 정의
    const tabs = ['대시보드', '고객관리', '매물장', '건물정보', '계약호실'];
    const dynamicTabIds = dynamicTables.map(t => t.id);
    const allTabs = [...tabs, ...dynamicTabIds];

    const currentIndex = allTabs.findIndex(t => t === activeTab);
    if (currentIndex === -1) return;

    if (diff > 0) {
      // 왼쪽 스와이프 → 다음 탭
      if (currentIndex < allTabs.length - 1) {
        setActiveTab(allTabs[currentIndex + 1]);
      }
    } else {
      // 오른쪽 스와이프 → 이전 탭
      if (currentIndex > 0) {
        setActiveTab(allTabs[currentIndex - 1]);
      }
    }
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


  // 계약호실 필터링
  const filteredContracts = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeContractFilter === '전체') {
      return contracts;
    }

    // "계약서작성" 필터: 진행상황이 '계약서작성'이고 계약서작성일이 오늘 이후
    if (activeContractFilter === '계약서작성') {
      return contracts.filter(c => {
        if (c.progressStatus !== '계약서작성') return false;
        if (!c.contractDate) return false;

        const contractDate = new Date(c.contractDate);
        contractDate.setHours(0, 0, 0, 0);

        return contractDate >= today;
      });
    }

    if (activeContractFilter === '잔금') {
      return contracts.filter(c => {
        if (c.progressStatus !== '잔금') return false;
        if (!c.balanceDate) return false;

        const balanceDate = new Date(c.balanceDate);
        balanceDate.setHours(0, 0, 0, 0);

        return balanceDate >= today;
      });
    }

    // "금월계약" 필터: 계약서작성일이 이번 달
    if (activeContractFilter === '금월계약') {
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      return contracts.filter(c => {
        if (!c.contractDate) return false;

        const contractDate = new Date(c.contractDate);
        return (
          contractDate.getFullYear() === currentYear &&
          contractDate.getMonth() === currentMonth
        );
      });
    }

    // "금월잔금" 필터: 잔금일이 이번 달
    if (activeContractFilter === '금월잔금') {
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      return contracts.filter(c => {
        if (!c.balanceDate) return false;

        const balanceDate = new Date(c.balanceDate);
        return (
          balanceDate.getFullYear() === currentYear &&
          balanceDate.getMonth() === currentMonth
        );
      });
    }

    // "전월입금" 필터: 입금일이 전달
    if (activeContractFilter === '전월입금') {
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
      const previousYear = previousMonthDate.getFullYear();
      const previousMonth = previousMonthDate.getMonth();

      return contracts.filter(c => {
        if (!c.remainderPaymentDate) return false;

        const paymentDate = new Date(c.remainderPaymentDate);
        return (
          paymentDate.getFullYear() === previousYear &&
          paymentDate.getMonth() === previousMonth
        );
      });
    }

    // "금월입금" 필터: 입금일이 이번 달
    if (activeContractFilter === '금월입금') {
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      return contracts.filter(c => {
        if (!c.remainderPaymentDate) return false;

        const paymentDate = new Date(c.remainderPaymentDate);
        return (
          paymentDate.getFullYear() === currentYear &&
          paymentDate.getMonth() === currentMonth
        );
      });
    }

    // "다음달입금" 필터: 입금일이 다음달
    if (activeContractFilter === '다음달입금') {
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
      const nextYear = nextMonthDate.getFullYear();
      const nextMonth = nextMonthDate.getMonth();

      return contracts.filter(c => {
        if (!c.remainderPaymentDate) return false;

        const paymentDate = new Date(c.remainderPaymentDate);
        return (
          paymentDate.getFullYear() === nextYear &&
          paymentDate.getMonth() === nextMonth
        );
      });
    }

    return contracts.filter(c => c.progressStatus === activeContractFilter);
  })();

  // 동적 테이블 필터링 (카테고리 기반)
  const filteredDynamicTableData = (() => {
    if (!dynamicTables.some(t => t.id === activeTab)) {
      return [];
    }

    const tableData = dynamicTableData[activeTab] || [];
    const currentFilter = dynamicTableFilters[activeTab] || '전체';

    // 필터가 '전체'이면 전체 데이터 반환
    if (currentFilter === '전체') {
      return tableData;
    }

    // 미분류: category가 없거나 빈 값인 데이터
    if (currentFilter === '미분류') {
      return tableData.filter(row => !row.category || row.category.trim() === '');
    }

    // category 필드로 필터링
    return tableData.filter(row => row.category === currentFilter);
  })();

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const selectedContract = contracts.find(c => c.id === selectedContractId);
  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      {/* 모바일 오버레이 배경 */}
      {isMobileSidebarOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* 북마크 헤더바 */}
      <BookmarkBar
        bookmarks={bookmarks}
        onOpenModal={handleOpenBookmarkModal}
        onEditBookmark={handleOpenBookmarkModal}
        onDeleteBookmark={handleDeleteBookmark}
        onSaveBookmark={handleSaveBookmark}
      />

      {/* 상단 콘텐츠 영역 (사이드바 + 메인콘텐츠) */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <FilterSidebar
          activeTab={activeTab}
          activeFilter={
            dynamicTables && dynamicTables.some(t => t.id === activeTab) ? (dynamicTableFilters[activeTab] || '전체') :
            activeTab === '고객관리' ? activeCustomerFilter :
            activeTab === '계약호실' ? activeContractFilter :
            activeTab === '대시보드' ? activeDashboardFilter :
            ''
          }
          onFilterChange={handleFilterChange}
          customers={customers}
          meetings={meetings}
          activities={activities}
          properties={properties}
          buildings={buildings}
          contracts={contracts}
          dynamicTableData={dynamicTableData}
          dynamicTables={dynamicTables}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        <div
          className="main-content"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          <header className="main-header">
            <button className="hamburger-btn" onClick={() => setIsMobileSidebarOpen(true)}>
              ☰
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h1 style={activeTab === '대시보드' ? { color: '#000000' } : {}}>
                {activeTab === '대시보드' ? (() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, '0');
                  const date = String(today.getDate()).padStart(2, '0');
                  const hours = String(today.getHours()).padStart(2, '0');
                  const minutes = String(today.getMinutes()).padStart(2, '0');
                  return (
                    <>
                      <span style={{ fontSize: 'calc(1em + 5px)' }}>대시보드</span>
                      <span style={{ fontSize: 'calc(1em - 4px)', color: '#ff0000', marginLeft: '20px' }}>{`${year}년 ${month}월 ${date}일 ${hours}:${minutes}`}</span>
                    </>
                  );
                })() : activeTab === '고객관리' ? '고객 목록' : activeTab === '매물장' ? '매물장' : activeTab === '건물정보' ? '건물정보' : activeTab === '계약호실' ? '계약호실' : dynamicTables.find(t => t.id === activeTab)?.name || 'Unknown'}
              </h1>
              {activeTab === '대시보드' && (
                <span style={{ fontSize: '11px', color: '#999' }}>
                  마지막 업데이트: {new Date().toLocaleString('ko-KR')}
                </span>
              )}
              {activeTab === '고객관리' && activeCustomerFilter !== '전체' && (
                <span style={{ fontSize: '13px', color: '#7f8c8d' }}>
                  필터: {activeCustomerFilter} - {getFilterDescription(activeCustomerFilter)}
                </span>
              )}
            </div>
            <div className="header-actions">
              {activeTab === '대시보드' ? (
                <></>
              ) : activeTab === '고객관리' ? (
                <>
                  <button onClick={() => handleOpenModal()} className="btn-primary">+ 고객 추가</button>
                  <button onClick={handleBackup} className="btn-secondary">백업</button>
                  <button onClick={() => restoreInputRef.current?.click()} className="btn-secondary">복원</button>
                  <input type="file" ref={restoreInputRef} onChange={handleRestore} style={{ display: 'none' }} accept=".json"/>
                </>
              ) : activeTab === '매물장' ? (
                <>
                  <button onClick={() => handleOpenPropertyModal()} className="btn-primary">+ 매물 추가</button>
                  <button onClick={() => setIsPropertyImporterOpen(true)} className="btn-secondary">CSV 임포트</button>
                  <button onClick={handleBackup} className="btn-secondary">백업</button>
                  <button onClick={() => restoreInputRef.current?.click()} className="btn-secondary">복원</button>
                  <input type="file" ref={restoreInputRef} onChange={handleRestore} style={{ display: 'none' }} accept=".json"/>
                </>
              ) : activeTab === '건물정보' ? (
                <>
                  <button onClick={() => handleOpenBuildingModal()} className="btn-primary">+ 건물 추가</button>
                  <button onClick={() => setIsBuildingImporterOpen(true)} className="btn-secondary">CSV 임포트</button>
                  <button onClick={handleRemoveDuplicateBuildings} className="btn-secondary">중복 제거</button>
                  <button onClick={handleBackup} className="btn-secondary">백업</button>
                  <button onClick={() => restoreInputRef.current?.click()} className="btn-secondary">복원</button>
                  <input type="file" ref={restoreInputRef} onChange={handleRestore} style={{ display: 'none' }} accept=".json"/>
                </>
              ) : dynamicTables.some(t => t.id === activeTab) ? (
                <>
                  <button onClick={() => setIsDynamicRowModalOpen(true)} className="btn-primary">+ 행 추가</button>
                  <button onClick={() => setIsCSVImporterOpen(true)} className="btn-secondary">CSV 임포트</button>
                  <button
                    onClick={() => handleDeleteDynamicTable(activeTab)}
                    className="btn-danger"
                    style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none' }}
                  >
                    테이블 삭제
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleOpenContractModal()} className="btn-primary">+ 계약호실 추가</button>
                  <button onClick={() => setIsContractImporterOpen(true)} className="btn-secondary">CSV 임포트</button>
                  <button onClick={handleBackup} className="btn-secondary">백업</button>
                  <button onClick={() => restoreInputRef.current?.click()} className="btn-secondary">복원</button>
                  <input type="file" ref={restoreInputRef} onChange={handleRestore} style={{ display: 'none' }} accept=".json"/>
                </>
              )}
            </div>
          </header>
          <main className="table-container" style={{ flex: 1, overflow: activeTab === '대시보드' ? 'auto' : 'auto' }}>
            {activeTab === '대시보드' ? (
              <Dashboard
                customers={customers}
                meetings={meetings}
                activities={activities}
                properties={properties}
                contracts={contracts}
                activeFilter={activeDashboardFilter}
                onNavigate={(tab, filter, itemId, itemType, meetingId) => {
                  setActiveTab(tab);
                  setActiveCustomerFilter(filter);
                  // 계약 클릭 시 상세패널 열기
                  if (itemType === 'contract') {
                    setSelectedContractId(itemId);
                  }
                  // 고객 클릭 시 상세패널 열기
                  else if (itemType === 'customer') {
                    setSelectedCustomerId(itemId);
                    // 미팅ID가 전달되면 해당 미팅 선택 (미팅탭에서 모달을 띄우게 함)
                    if (meetingId) {
                      setSelectedMeetingId(meetingId);
                    }
                  }
                }}
              />
            ) : activeTab === '고객관리' ? (
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
                onCloseDetailPanel={handleCloseDetailPanel}
              />
            ) : activeTab === '매물장' ? (
              <PropertyTable
                properties={properties}
                onSelectProperty={handleSelectProperty}
                onEdit={handleOpenPropertyModal}
                onDelete={handleDeleteProperty}
                selectedPropertyId={selectedPropertyId}
                onCloseDetailPanel={handleCloseDetailPanel}
              />
            ) : activeTab === '건물정보' ? (
              <BuildingTable
                buildings={buildings}
                onSelectBuilding={handleSelectBuilding}
                onEdit={handleOpenBuildingModal}
                onDelete={handleDeleteBuilding}
                selectedBuildingId={selectedBuildingId}
                onCloseDetailPanel={handleCloseDetailPanel}
              />
            ) : dynamicTables.some(t => t.id === activeTab) ? (
              <DynamicTableView
                tableData={filteredDynamicTableData}
                tableMetadata={dynamicTables.find(t => t.id === activeTab)}
                onSelectRow={handleSelectDynamicRow}
                onEdit={handleSaveDynamicRow}
                onDelete={handleDeleteDynamicRow}
                selectedRowId={selectedDynamicRowId}
                onCloseDetailPanel={handleCloseDetailPanel}
              />
            ) : (
              <ContractTable
                contracts={filteredContracts}
                onSelectContract={handleSelectContract}
                onEdit={handleOpenContractModal}
                onDelete={handleDeleteContract}
                selectedContractId={selectedContractId}
                onCloseDetailPanel={handleCloseDetailPanel}
                activeFilter={activeContractFilter}
              />
            )}
          </main>
        </div>
      </div>

      {/* 하단 탭바 */}
      <div
        className="tab-bar"
        style={{
          display: 'flex',
          borderTop: '2px solid #e0e0e0',
          backgroundColor: '#f8f8f8',
          height: '70px',
          justifyContent: 'flex-start',
          paddingLeft: '40px',
          gap: '60px',
          alignItems: 'center',
          flexShrink: 0,
          width: '100%'
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={() => setActiveTab('대시보드')}
          style={{
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#000',
            border: 'none',
            backgroundColor: activeTab === '대시보드' ? 'rgba(76, 175, 80, 0.12)' : 'transparent',
            borderBottom: activeTab === '대시보드' ? '4px solid #4CAF50' : '4px solid transparent',
            borderRadius: activeTab === '대시보드' ? '8px 8px 0 0' : '0',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === '대시보드' ? '0 -2px 8px rgba(0,0,0,0.08)' : 'none',
            WebkitAppearance: 'none',
            appearance: 'none'
          }}
          className="tab-button"
        >
          📊 대시보드
        </button>
        <button
          onClick={() => setActiveTab('고객관리')}
          style={{
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#000',
            border: 'none',
            backgroundColor: activeTab === '고객관리' ? 'rgba(33, 150, 243, 0.12)' : 'transparent',
            borderBottom: activeTab === '고객관리' ? '4px solid #FF6B9D' : '4px solid transparent',
            borderRadius: activeTab === '고객관리' ? '8px 8px 0 0' : '0',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === '고객관리' ? '0 -2px 8px rgba(0,0,0,0.08)' : 'none',
            WebkitAppearance: 'none',
            appearance: 'none'
          }}
          className="tab-button"
        >
          📋 고객목록
        </button>
        <button
          onClick={() => setActiveTab('매물장')}
          style={{
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#000',
            border: 'none',
            backgroundColor: activeTab === '매물장' ? 'rgba(33, 150, 243, 0.12)' : 'transparent',
            borderBottom: activeTab === '매물장' ? '4px solid #2196F3' : '4px solid transparent',
            borderRadius: activeTab === '매물장' ? '8px 8px 0 0' : '0',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === '매물장' ? '0 -2px 8px rgba(0,0,0,0.08)' : 'none',
            WebkitAppearance: 'none',
            appearance: 'none'
          }}
          className="tab-button"
        >
          🏠 매물장
        </button>
        <button
          onClick={() => setActiveTab('건물정보')}
          style={{
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#000',
            border: 'none',
            backgroundColor: activeTab === '건물정보' ? 'rgba(33, 150, 243, 0.12)' : 'transparent',
            borderBottom: activeTab === '건물정보' ? '4px solid #FF9800' : '4px solid transparent',
            borderRadius: activeTab === '건물정보' ? '8px 8px 0 0' : '0',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === '건물정보' ? '0 -2px 8px rgba(0,0,0,0.08)' : 'none',
            WebkitAppearance: 'none',
            appearance: 'none'
          }}
          className="tab-button"
        >
          🏢 건물정보
        </button>

        {/* 동적 테이블 탭들 */}
        {dynamicTables.map(table => (
          <button
            key={table.id}
            onClick={() => setActiveTab(table.id)}
            style={{
              padding: '12px 24px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#000',
              border: 'none',
              backgroundColor: activeTab === table.id ? 'rgba(76, 175, 80, 0.12)' : 'transparent',
              borderBottom: activeTab === table.id ? '4px solid #4CAF50' : '4px solid transparent',
              borderRadius: activeTab === table.id ? '8px 8px 0 0' : '0',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === table.id ? '0 -2px 8px rgba(0,0,0,0.08)' : 'none',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
            className="tab-button"
          >
            {table.icon} {table.name}
          </button>
        ))}

        {/* 테이블 추가 버튼 */}
        <button
          onClick={() => setIsTableCreatorOpen(true)}
          style={{
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#4CAF50',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            WebkitAppearance: 'none',
            appearance: 'none'
          }}
          className="tab-button"
          onMouseEnter={(e) => e.target.style.color = '#45a049'}
          onMouseLeave={(e) => e.target.style.color = '#4CAF50'}
        >
          + 테이블 추가
        </button>
      </div>

      {activeTab === '고객관리' && (
        <>
          <CustomerDetailPanel
            selectedCustomer={selectedCustomer}
            onClose={() => {
              setSelectedCustomerId(null);
              setSelectedMeetingId(null);
            }}
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
            selectedMeetingId={selectedMeetingId}
            onClearSelectedMeeting={() => setSelectedMeetingId(null)}
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

          {/* PropertyImporter */}
          {isPropertyImporterOpen && (
            <PropertyImporter
              onImport={handleImportProperties}
              onClose={() => setIsPropertyImporterOpen(false)}
            />
          )}
        </>
      )}

      {activeTab === '건물정보' && (
        <>
          {/* BuildingImporter */}
          {isBuildingImporterOpen && (
            <BuildingImporter
              onImport={handleImportBuildings}
              onClose={() => setIsBuildingImporterOpen(false)}
            />
          )}
        </>
      )}

      {activeTab === '건물정보' && (
        <>
          {/* BuildingDetailPanel */}
          <BuildingDetailPanel
            selectedBuilding={buildings.find(b => b.id === selectedBuildingId)}
            onClose={() => setSelectedBuildingId(null)}
            onEdit={handleOpenBuildingModal}
            onDelete={handleDeleteBuilding}
            onUpdateBuilding={handleSaveBuilding}
          />

          {/* BuildingModal */}
          <BuildingModal
            isOpen={isBuildingModalOpen}
            onClose={handleCloseBuildingModal}
            onSave={handleSaveBuilding}
            building={editingBuilding}
          />
        </>
      )}

      {activeTab === '계약호실' && (
        <>
          {/* ContractDetailPanel */}
          <ContractDetailPanel
            selectedContract={selectedContract}
            onClose={() => setSelectedContractId(null)}
            onEditContract={handleOpenContractModal}
            onUpdateContract={handleSaveContract}
            onDeleteContract={handleDeleteContract}
          />

          {/* ContractModal */}
          <ContractModal
            isOpen={isContractModalOpen}
            onClose={handleCloseContractModal}
            onSave={handleSaveContract}
            editData={editingContract}
          />

          {/* ContractImporter */}
          {isContractImporterOpen && (
            <ContractImporter
              onImport={handleImportContracts}
              onClose={() => setIsContractImporterOpen(false)}
            />
          )}
        </>
      )}

      {/* TableCreator Modal */}
      <TableCreator
        isOpen={isTableCreatorOpen}
        onClose={() => setIsTableCreatorOpen(false)}
        onCreateTable={handleCreateDynamicTable}
      />

      {/* DynamicCSVImporter Modal */}
      <DynamicCSVImporter
        isOpen={isCSVImporterOpen}
        onClose={() => setIsCSVImporterOpen(false)}
        onImport={handleImportCSVTable}
      />

      {/* DynamicRowModal */}
      <DynamicRowModal
        isOpen={isDynamicRowModalOpen}
        onClose={() => setIsDynamicRowModalOpen(false)}
        onSave={handleAddDynamicRow}
        tableMetadata={dynamicTables.find(t => t.id === activeTab)}
      />

      {/* BookmarkModal */}
      <BookmarkModal
        isOpen={isBookmarkModalOpen}
        onClose={handleCloseBookmarkModal}
        onSave={handleSaveBookmark}
        editingBookmark={editingBookmark}
        selectedSection={selectedBookmarkSection}
      />
    </div>
  );
}

export default App;
