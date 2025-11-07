import React, { useState, useEffect } from 'react';
import {
  CONTRACT_PROGRESS_STATUSES,
  CONTRACT_PROPERTY_MANAGEMENT,
  CONTRACT_EXPIRY_MANAGEMENT,
  PROPERTY_TYPES_FOR_BROKERAGE,
  TRANSACTION_TYPES
} from '../constants';
import { formatAmountToKorean } from '../utils/helpers';

const ContractDetailPanel = ({ selectedContract, isOpen, onClose, onEdit, onDelete, onUpdateContract }) => {
  const [selectedProgressStatus, setSelectedProgressStatus] = useState(selectedContract?.progressStatus || '');
  const [selectedPropertyManagement, setSelectedPropertyManagement] = useState(selectedContract?.propertyManagement || '');
  const [selectedExpiryManagement, setSelectedExpiryManagement] = useState(selectedContract?.expiryManagement || '');
  const [memoEditMode, setMemoEditMode] = useState(false);
  const [editingMemo, setEditingMemo] = useState(selectedContract?.memo || '');
  const [activeTab, setActiveTab] = useState('기본정보');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calcDeposit, setCalcDeposit] = useState('');
  const [calcMonthlyRent, setCalcMonthlyRent] = useState('');
  const [calcFeeRate, setCalcFeeRate] = useState('');
  const [calculatedFee, setCalculatedFee] = useState(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [selectedTransactionType, setSelectedTransactionType] = useState('');
  const [editingBrokerageFee, setEditingBrokerageFee] = useState(selectedContract?.brokerageFee?.toString() || '');
  const [editingRemainderPaymentDate, setEditingRemainderPaymentDate] = useState(selectedContract?.remainderPaymentDate || '');
  const [brokerageMemoEditMode, setBrokerageMemoEditMode] = useState(false);
  const [editingBrokerageMemo, setEditingBrokerageMemo] = useState(selectedContract?.brokerageMemo || '');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState(selectedContract?.feeStatus || '미입금');
  const [editingHistoryItemId, setEditingHistoryItemId] = useState(null);
  const [editingHistoryContent, setEditingHistoryContent] = useState('');
  const [tempExpiryManagement, setTempExpiryManagement] = useState(selectedContract?.expiryManagement || '');

  useEffect(() => {
    setSelectedProgressStatus(selectedContract?.progressStatus || '');
    setSelectedPropertyManagement(selectedContract?.propertyManagement || '');
    setSelectedExpiryManagement(selectedContract?.expiryManagement || '');
    setEditingMemo(selectedContract?.memo || '');
    setMemoEditMode(false);
    setEditingBrokerageFee(selectedContract?.brokerageFee?.toString() || '');
    setEditingRemainderPaymentDate(selectedContract?.remainderPaymentDate || '');
    setBrokerageMemoEditMode(false);
    setEditingBrokerageMemo(selectedContract?.brokerageMemo || '');
    setSelectedFeeStatus(selectedContract?.feeStatus || '미입금');

    // 입금일이 비어있을 때 잔금일로 자동 설정
    if (selectedContract && !selectedContract.remainderPaymentDate && selectedContract.balanceDate) {
      const updatedContract = {
        ...selectedContract,
        remainderPaymentDate: selectedContract.balanceDate
      };
      setEditingRemainderPaymentDate(selectedContract.balanceDate);
      onUpdateContract(updatedContract);
    }
  }, [selectedContract?.id]);

  // 새로운 계약을 선택했을 때만 탭을 초기화
  useEffect(() => {
    setActiveTab('기본정보');
  }, [selectedContract?.id]);

  // 연장관리 탭 진입 시 tempExpiryManagement 초기화
  useEffect(() => {
    if (activeTab === '연장관리') {
      setTempExpiryManagement(selectedContract?.expiryManagement || '');
    }
  }, [activeTab, selectedContract?.expiryManagement]);

  // 물건유형 변경 시 중개요율 자동 설정
  useEffect(() => {
    if (selectedPropertyType) {
      if (selectedPropertyType === '주거용오피스텔') {
        setCalcFeeRate('0.4');
      } else if (selectedPropertyType === '주택') {
        setCalcFeeRate('0.3');
      } else if (selectedPropertyType === '그 외 토지상가') {
        setCalcFeeRate('0.9');
      }
    }
  }, [selectedPropertyType]);

  // 계산기 열 때 기본정보에서 보증금과 월세 자동 입력
  useEffect(() => {
    if (isCalculatorOpen && selectedContract) {
      if (selectedContract.deposit) {
        setCalcDeposit(Math.floor(selectedContract.deposit / 10000).toString());
      }
      if (selectedContract.monthlyRent) {
        setCalcMonthlyRent(Math.floor(selectedContract.monthlyRent / 10000).toString());
      }
    }
  }, [isCalculatorOpen, selectedContract]);

  // 계산기에서 계산된 값이 변경되면 중개보수금액에 자동 설정
  useEffect(() => {
    if (calculatedFee !== null) {
      setEditingBrokerageFee(calculatedFee.toString());
    }
  }, [calculatedFee]);

  if (!isOpen || !selectedContract) return null;

  // 날짜를 "2025. 8. 13" 형식으로 변환
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    if (dateStr.includes('.')) return dateStr; // 이미 형식화된 경우
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}. ${month}. ${day}`;
  };

  // 드롭다운 선택 저장
  const handleSave = () => {
    const updatedContract = {
      ...selectedContract,
      progressStatus: selectedProgressStatus,
      propertyManagement: selectedPropertyManagement,
      expiryManagement: selectedExpiryManagement
    };
    onUpdateContract(updatedContract);
  };

  // 만기관리 상태 저장
  const handleSaveExpiryManagement = () => {
    const updated = { ...selectedContract, expiryManagement: tempExpiryManagement };
    onUpdateContract(updated);
    setSelectedExpiryManagement(tempExpiryManagement);
    alert('만기관리 상태가 저장되었습니다.');
  };

  // 메모 더블클릭 시 편집 모드 활성화
  const handleMemoDoubleClick = () => {
    setMemoEditMode(true);
  };

  // 메모 저장
  const handleMemoSave = () => {
    const updatedContract = {
      ...selectedContract,
      memo: editingMemo
    };
    onUpdateContract(updatedContract);
    setMemoEditMode(false);
  };

  // 메모 편집 취소
  const handleMemoCancel = () => {
    setEditingMemo(selectedContract?.memo || '');
    setMemoEditMode(false);
  };

  // 메모 textarea 키 이벤트 처리
  const handleMemoKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleMemoCancel();
    } else if (e.ctrlKey && e.key === 'Enter') {
      handleMemoSave();
    }
  };

  // 중개보수 계산
  const handleCalculate = () => {
    const deposit = Number(calcDeposit) || 0;
    const monthlyRent = Number(calcMonthlyRent) || 0;
    const feeRate = Number(calcFeeRate) || 0;

    const result = (deposit + (monthlyRent * 100)) * (feeRate / 100);
    setCalculatedFee(Math.round(result));
  };

  // 계산된 중개보수 적용
  const handleApplyFee = () => {
    // 만원 단위 값을 원 단위로 변환 (예: 13만원 → 130000원)
    const feeInWon = calculatedFee * 10000;
    const updatedContract = {
      ...selectedContract,
      brokerageFee: feeInWon
    };
    onUpdateContract(updatedContract);
    setIsCalculatorOpen(false);
    setCalculatedFee(null);
    setCalcDeposit('');
    setCalcMonthlyRent('');
    setCalcFeeRate('');
  };

  // 계산기 취소
  const handleCalculatorCancel = () => {
    setIsCalculatorOpen(false);
    setCalculatedFee(null);
    setCalcDeposit('');
    setCalcMonthlyRent('');
    setCalcFeeRate('');
  };

  // 금액 포맷팅 (만원 → 억/만원)
  const formatAmount = (amountInManwon) => {
    if (!amountInManwon) return '0원';

    const amount = Number(amountInManwon);
    if (amount === 0) return '0원';

    const eok = Math.floor(amount / 10000);
    const manwon = amount % 10000;

    if (eok > 0 && manwon > 0) {
      return `${eok}억${manwon.toLocaleString()}만원`;
    } else if (eok > 0) {
      return `${eok}억원`;
    } else {
      return `${manwon.toLocaleString()}만원`;
    }
  };

  // 중개보수 안내문자 생성
  const generateBrokageMessage = () => {
    if (calculatedFee === null) return '';

    const deposit = Number(calcDeposit) || 0;
    const monthlyRent = Number(calcMonthlyRent) || 0;
    const feeRate = Number(calcFeeRate) || 0;

    // 환산보증금 계산
    const convertedDeposit = deposit + (monthlyRent * 100);

    // 부가세(10%) 계산
    const vat = Math.round(calculatedFee / 10);
    const totalWithVat = calculatedFee + vat;
    const feeWithoutVat = calculatedFee;

    // 정렬 함수 (가장 긴 라벨 기준 + 고정 2칸 간격)
    // 가장 긴 라벨: "부가세(10%)" = 9글자
    const maxLabelLength = 9;
    const alignWithFixedGap = (label, value) => {
      const padding = ' '.repeat(maxLabelLength - label.length + 2);
      return label + padding + value;
    };

    const message = `[중개보수 안내]

${alignWithFixedGap('지역', '      서울특별시')}
${alignWithFixedGap('물건유형', '  ' + (selectedPropertyType || '-'))}
${alignWithFixedGap('거래유형', '  ' + (selectedTransactionType || '-'))}
${alignWithFixedGap('보증금/월세', formatAmount(deposit) + ' / ' + formatAmount(monthlyRent))}
${alignWithFixedGap('환산보증금', formatAmount(convertedDeposit))}
${alignWithFixedGap('상한요율', '  ' + feeRate + '%')}
${alignWithFixedGap('한도금액', ' 없음')}

${alignWithFixedGap('중개보수', ' ' + feeWithoutVat.toLocaleString() + '만원')}
${alignWithFixedGap('부가세(10%)', vat.toLocaleString() + '만원')}
${alignWithFixedGap('합계', '  ' + totalWithVat.toLocaleString() + '만원')}

중개수수료: ${totalWithVat.toLocaleString()}만원(부가세포함)
110-355-630099 신한은행 스마트공인중개사사무소(최영현)

현금영수증 필요없으시면 ${feeWithoutVat.toLocaleString()}만원 입금해주시면 됩니다.`;

    return message;
  };

  return (
    <aside
      className="detail-panel open"
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100vh',
        borderLeft: '1px solid #e0e0e0',
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        backgroundColor: '#fff',
        overflow: 'hidden',
        zIndex: 50,
        boxShadow: '-2px 0 8px rgba(0,0,0,0.1)'
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            {selectedContract.buildingName} {selectedContract.roomName}
          </h3>
          <p style={{ fontSize: '13px', color: '#999', margin: '4px 0 0 0' }}>
            {selectedContract.tenantName || '-'} {selectedContract.propertyLocation ? `· ${selectedContract.propertyLocation}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => onEdit(selectedContract)}
            className="btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            수정
          </button>
          <button
            onClick={onClose}
            className="btn-close"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: 0,
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div style={{ display: 'flex', gap: '4px', padding: '12px 15px', backgroundColor: '#e3f2fd', borderRadius: '8px', margin: '15px', border: '1px solid #bbdefb' }}>
        {['기본정보', 'History', '중개보수', '연장관리'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '700',
              border: activeTab === tab ? '1px solid #e0e0e0' : '1px solid transparent',
              borderRadius: '6px',
              backgroundColor: activeTab === tab ? 'white' : 'transparent',
              color: '#1a1a1a',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === tab ? '0 2px 8px rgba(33, 150, 243, 0.15)' : 'none'
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

      {/* 콘텐츠 */}
      <div className="panel-content" style={{ flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {activeTab === '기본정보' && (
          <>
            {/* 드롭다운 선택 영역 */}
            <div style={{ padding: '15px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#fafafa', border: '1px solid #e0e0e0' }}>
              {/* 진행상황 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', minWidth: '80px' }}>
                  진행상황:
                </label>
                <select
                  value={selectedProgressStatus}
                  onChange={(e) => setSelectedProgressStatus(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}
                >
                  {CONTRACT_PROGRESS_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* 매물관리 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', minWidth: '80px' }}>
                  매물관리:
                </label>
                <select
                  value={selectedPropertyManagement}
                  onChange={(e) => setSelectedPropertyManagement(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}
                >
                  <option value="">선택하세요</option>
                  {CONTRACT_PROPERTY_MANAGEMENT.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* 만기관리 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', minWidth: '80px' }}>
                  만기관리:
                </label>
                <select
                  value={selectedExpiryManagement}
                  onChange={(e) => setSelectedExpiryManagement(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}
                >
                  <option value="">선택하세요</option>
                  {CONTRACT_EXPIRY_MANAGEMENT.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* 저장 버튼 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  저장
                </button>
              </div>
            </div>

            {/* 기본정보 섹션 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #FF6B9D' }}>
            📋 기본 정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>건물명:</span>
              <span style={{ color: '#333' }}>{selectedContract.buildingName || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>호실명:</span>
              <span style={{ color: '#333' }}>{selectedContract.roomName || '-'}</span>
            </div>
          </div>
        </section>

        {/* 날짜정보 섹션 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #FF9800' }}>
            📅 날짜정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>계약서작성일:</span>
              <span style={{ color: '#333' }}>{formatDate(selectedContract.contractDate)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>잔금일:</span>
              <span style={{ color: '#333' }}>{formatDate(selectedContract.balanceDate)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>만기일:</span>
              <span style={{ color: '#333' }}>{formatDate(selectedContract.expiryDate)}</span>
            </div>
          </div>
        </section>

        {/* 임대인정보 섹션 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #2196F3' }}>
            👤 임대인정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>이름:</span>
              <span style={{ color: '#333' }}>{selectedContract.landlordName || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>번호:</span>
              <span style={{ color: '#333' }}>
                {selectedContract.landlordPhone ? (
                  <a href={`sms:${selectedContract.landlordPhone}`} style={{ color: '#2196F3', textDecoration: 'none' }}>
                    {selectedContract.landlordPhone}
                  </a>
                ) : '-'}
              </span>
            </div>
          </div>
        </section>

        {/* 임차인정보 섹션 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #9C27B0' }}>
            👥 임차인정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>이름:</span>
              <span style={{ color: '#333' }}>{selectedContract.tenantName || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>번호:</span>
              <span style={{ color: '#333' }}>
                {selectedContract.tenantPhone ? (
                  <a href={`sms:${selectedContract.tenantPhone}`} style={{ color: '#2196F3', textDecoration: 'none' }}>
                    {selectedContract.tenantPhone}
                  </a>
                ) : '-'}
              </span>
            </div>
          </div>
        </section>

        {/* 계약정보 섹션 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #4CAF50' }}>
            💰 계약 정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>보증금:</span>
              <span style={{ color: '#333' }}>
                {selectedContract.deposit ? parseInt(selectedContract.deposit).toLocaleString('ko-KR') : '-'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>월세:</span>
              <span style={{ color: '#333' }}>
                {selectedContract.monthlyRent ? parseInt(selectedContract.monthlyRent).toLocaleString('ko-KR') : '-'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>매매가:</span>
              <span style={{ color: '#333' }}>
                {selectedContract.salePrice ? formatAmountToKorean(selectedContract.salePrice) : '-'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>계약기간:</span>
              <span style={{ color: '#333' }}>
                {selectedContract.contractPeriod ? `${selectedContract.contractPeriod}개월` : '-'}
              </span>
            </div>
          </div>
        </section>

        {/* 추가정보 섹션 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #607D8B' }}>
            ℹ️ 추가 정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>등록일:</span>
              <span style={{ color: '#333' }}>{selectedContract.createdAt ? formatDate(selectedContract.createdAt.split('T')[0]) : '-'}</span>
            </div>
          </div>
        </section>

        {/* 메모 섹션 */}
        <section>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #9C27B0' }}>
            📝 메모
          </h4>
          {!memoEditMode ? (
            // 읽기 모드
            <div
              onDoubleClick={handleMemoDoubleClick}
              style={{
                fontSize: '13px',
                color: editingMemo ? '#333' : '#999',
                padding: '10px',
                backgroundColor: '#f3e5f5',
                borderRadius: '4px',
                borderLeft: '3px solid #9C27B0',
                minHeight: '80px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: '1.5',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              {editingMemo || '더블클릭하여 메모 추가'}
            </div>
          ) : (
            // 편집 모드
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea
                value={editingMemo}
                onChange={(e) => setEditingMemo(e.target.value)}
                onKeyDown={handleMemoKeyDown}
                autoFocus
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '10px',
                  border: '2px solid #9C27B0',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  lineHeight: '1.5',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleMemoCancel}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleMemoSave}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    backgroundColor: '#9C27B0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  저장
                </button>
              </div>
            </div>
          )}
        </section>
          </>
        )}

        {activeTab === 'History' && (
          <>
            {/* 추가 버튼 */}
            <div style={{ marginBottom: '15px' }}>
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  const historyCards = selectedContract.historyCards || [];
                  let todayCard = historyCards.find(card => card.date === today);

                  if (!todayCard) {
                    todayCard = {
                      id: `hist_${today}`,
                      date: today,
                      items: [],
                      createdAt: new Date().toISOString()
                    };
                    historyCards.push(todayCard);
                  }

                  todayCard.items.push({
                    id: `item_${Date.now()}`,
                    content: '',
                    createdAt: new Date().toISOString()
                  });

                  onUpdateContract({ ...selectedContract, historyCards });
                  setEditingHistoryItemId(historyCards[historyCards.length - 1].items[historyCards[historyCards.length - 1].items.length - 1].id);
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                + 히스토리 추가
              </button>
            </div>

            {/* 날짜별 히스토리 카드 목록 (최신순) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {selectedContract.historyCards && selectedContract.historyCards.length > 0 ? (
                (() => {
                  const sortedCards = [...(selectedContract.historyCards || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
                  return sortedCards.map(card => {
                    const cardDate = new Date(card.date);
                    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][cardDate.getDay()];
                    const formattedDate = `${cardDate.getFullYear()}년 ${String(cardDate.getMonth() + 1).padStart(2, '0')}월 ${String(cardDate.getDate()).padStart(2, '0')}일 (${dayOfWeek})`;

                    return (
                      <section key={card.id} style={{ padding: '15px', border: '1px solid #e0e0e0', borderLeft: '3px solid #2196F3', borderRadius: '6px', backgroundColor: '#fafafa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>📋 {formattedDate}</h4>
                          <button
                            onClick={() => {
                              if (window.confirm('이 카드의 모든 히스토리를 삭제하시겠습니까?')) {
                                const updatedCards = (selectedContract.historyCards || []).filter(c => c.id !== card.id);
                                onUpdateContract({ ...selectedContract, historyCards: updatedCards });
                              }
                            }}
                            style={{
                              padding: '4px 12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: '#ffebee',
                              color: '#c62828',
                              border: '1px solid #ef5350',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            카드 삭제
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {card.items && card.items.length > 0 ? (
                            [...card.items].reverse().map(item => {
                              const isEditing = editingHistoryItemId === item.id;

                              return (
                                <div key={item.id} style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                  {isEditing ? (
                                    <textarea
                                      autoFocus
                                      value={editingHistoryContent}
                                      onChange={(e) => setEditingHistoryContent(e.target.value)}
                                      onBlur={() => {
                                        if (editingHistoryContent.trim()) {
                                          const updatedCards = selectedContract.historyCards.map(c => {
                                            if (c.id === card.id) {
                                              return {
                                                ...c,
                                                items: c.items.map(i => i.id === item.id ? { ...i, content: editingHistoryContent } : i)
                                              };
                                            }
                                            return c;
                                          });
                                          onUpdateContract({ ...selectedContract, historyCards: updatedCards });
                                        }
                                        setEditingHistoryItemId(null);
                                        setEditingHistoryContent('');
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                          setEditingHistoryItemId(null);
                                          setEditingHistoryContent('');
                                        }
                                      }}
                                      style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        border: '2px solid #2196F3',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        minHeight: '50px',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        boxSizing: 'border-box'
                                      }}
                                    />
                                  ) : (
                                    <p
                                      onDoubleClick={() => {
                                        setEditingHistoryItemId(item.id);
                                        setEditingHistoryContent(item.content);
                                      }}
                                      style={{
                                        flex: 1,
                                        margin: 0,
                                        fontSize: '13px',
                                        color: '#555',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        lineHeight: '1.5',
                                        cursor: 'text',
                                        padding: '6px',
                                        borderRadius: '3px',
                                        backgroundColor: item.content ? '#fff' : '#f9f9f9',
                                        minHeight: '30px',
                                        display: 'flex',
                                        alignItems: 'center'
                                      }}
                                    >
                                      {item.content || '(더블클릭하여 내용 입력)'}
                                    </p>
                                  )}
                                  <button
                                    onClick={() => {
                                      if (window.confirm('이 항목을 삭제하시겠습니까?')) {
                                        const updatedCards = selectedContract.historyCards.map(c => {
                                          if (c.id === card.id) {
                                            const updatedItems = c.items.filter(i => i.id !== item.id);
                                            if (updatedItems.length === 0) {
                                              return null;
                                            }
                                            return { ...c, items: updatedItems };
                                          }
                                          return c;
                                        }).filter(Boolean);
                                        onUpdateContract({ ...selectedContract, historyCards: updatedCards });
                                      }
                                    }}
                                    style={{
                                      padding: '4px 8px',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      backgroundColor: '#ffebee',
                                      color: '#c62828',
                                      border: '1px solid #ef5350',
                                      borderRadius: '3px',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    삭제
                                  </button>
                                </div>
                              );
                            })
                          ) : (
                            <p style={{ margin: 0, fontSize: '13px', color: '#999', textAlign: 'center', padding: '10px' }}>이 날짜의 히스토리가 없습니다</p>
                          )}
                        </div>
                      </section>
                    );
                  });
                })()
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                  <p style={{ margin: 0, fontSize: '14px' }}>히스토리가 없습니다</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>위의 버튼을 클릭하여 첫 항목을 추가해주세요.</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === '중개보수' && (
          <>
            {/* 계산 버튼 */}
            <div style={{ marginBottom: '15px' }}>
              <button
                onClick={() => {
                  setIsCalculatorOpen(!isCalculatorOpen);
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isCalculatorOpen ? '계산기 닫기' : '계산하기'}
              </button>
            </div>

            {/* 계산기 폼 */}
            {isCalculatorOpen && (
              <div style={{
                padding: '15px',
                backgroundColor: '#fff8e1',
                borderRadius: '6px',
                border: '1px solid #FFB74D',
                marginBottom: '15px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
                  📊 중개보수 계산기
                </div>

                {/* 물건유형 및 거래유형 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>물건유형</label>
                    <select
                      value={selectedPropertyType}
                      onChange={(e) => setSelectedPropertyType(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #FFB74D',
                        borderRadius: '4px',
                        fontSize: '13px',
                        backgroundColor: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">선택</option>
                      {PROPERTY_TYPES_FOR_BROKERAGE.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>거래유형</label>
                    <select
                      value={selectedTransactionType}
                      onChange={(e) => setSelectedTransactionType(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #FFB74D',
                        borderRadius: '4px',
                        fontSize: '13px',
                        backgroundColor: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">선택</option>
                      {TRANSACTION_TYPES.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 보증금 및 월세 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>보증금 (만원)</label>
                    <input
                      type="number"
                      value={calcDeposit}
                      onChange={(e) => setCalcDeposit(e.target.value)}
                      placeholder="예: 10000"
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #FFB74D',
                        borderRadius: '4px',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>월세 (만원)</label>
                    <input
                      type="number"
                      value={calcMonthlyRent}
                      onChange={(e) => setCalcMonthlyRent(e.target.value)}
                      placeholder="예: 50"
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #FFB74D',
                        borderRadius: '4px',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* 중개요율 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>중개요율 (%)</label>
                  <input
                    type="number"
                    value={calcFeeRate}
                    onChange={(e) => setCalcFeeRate(e.target.value)}
                    placeholder="예: 0.4"
                    step="0.1"
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #FFB74D',
                      borderRadius: '4px',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* 계산 결과 */}
                {calculatedFee !== null && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '4px',
                    borderLeft: '3px solid #2196F3'
                  }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>계산 결과</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2196F3' }}>
                      {(calculatedFee * 10000).toLocaleString('ko-KR')} 원
                    </div>
                  </div>
                )}

                {/* 안내문자 생성 */}
                {calculatedFee !== null && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    marginTop: '10px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                      📱 안내문자 (복사)
                    </div>
                    <pre style={{
                      fontSize: '12px',
                      color: '#333',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      margin: 0,
                      padding: '8px',
                      backgroundColor: '#fff',
                      borderRadius: '3px',
                      border: '1px solid #e0e0e0',
                      lineHeight: '1.4'
                    }}>
                      {generateBrokageMessage()}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generateBrokageMessage());
                        alert('메시지가 복사되었습니다!');
                      }}
                      style={{
                        width: '100%',
                        marginTop: '8px',
                        padding: '8px 12px',
                        fontSize: '13px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      복사
                    </button>
                  </div>
                )}

                {/* 버튼 그룹 */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    onClick={handleCalculate}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '13px',
                      backgroundColor: '#FF9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    계산
                  </button>
                  {calculatedFee !== null && (
                    <button
                      onClick={handleApplyFee}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: '13px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      적용
                    </button>
                  )}
                  <button
                    onClick={handleCalculatorCancel}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '13px',
                      backgroundColor: '#f5f5f5',
                      color: '#333',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            <section>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #4CAF50' }}>
                💰 중개보수 정보
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontWeight: '600', color: '#666' }}>중개보수금액 (원)</label>
                  <input
                    type="number"
                    value={editingBrokerageFee}
                    onChange={(e) => setEditingBrokerageFee(e.target.value)}
                    onBlur={() => {
                      if (editingBrokerageFee !== selectedContract.brokerageFee?.toString()) {
                        onUpdateContract({
                          ...selectedContract,
                          brokerageFee: editingBrokerageFee ? Number(editingBrokerageFee) : null
                        });
                      }
                    }}
                    placeholder="중개보수금액 입력"
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                  {editingBrokerageFee && (
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {Number(editingBrokerageFee).toLocaleString('ko-KR')} 원
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontWeight: '600', color: '#666' }}>입금일</label>
                  <input
                    type="date"
                    value={editingRemainderPaymentDate}
                    onChange={(e) => setEditingRemainderPaymentDate(e.target.value)}
                    onBlur={() => {
                      if (editingRemainderPaymentDate !== selectedContract.remainderPaymentDate) {
                        onUpdateContract({
                          ...selectedContract,
                          remainderPaymentDate: editingRemainderPaymentDate
                        });
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '100px auto', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: '#666' }}>입금상태:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const updated = { ...selectedContract, feeStatus: '입금됨' };
                        onUpdateContract(updated);
                      }}
                      style={{
                        padding: '5px 10px',
                        fontSize: '12px',
                        backgroundColor: selectedContract?.feeStatus === '입금됨' ? '#4CAF50' : '#e0e0e0',
                        color: selectedContract?.feeStatus === '입금됨' ? 'white' : '#666',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      입금됨
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const updated = { ...selectedContract, feeStatus: '미입금' };
                        onUpdateContract(updated);
                      }}
                      style={{
                        padding: '5px 10px',
                        fontSize: '12px',
                        backgroundColor: (!selectedContract?.feeStatus || selectedContract?.feeStatus === '미입금') ? '#f44336' : '#e0e0e0',
                        color: (!selectedContract?.feeStatus || selectedContract?.feeStatus === '미입금') ? 'white' : '#666',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      미입금
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #FF9800' }}>
                📝 중개보수 메모
              </h4>
              {brokerageMemoEditMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea
                    value={editingBrokerageMemo}
                    onChange={(e) => setEditingBrokerageMemo(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '13px',
                      border: '1px solid #FF9800',
                      borderRadius: '4px',
                      minHeight: '80px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        onUpdateContract({
                          ...selectedContract,
                          brokerageMemo: editingBrokerageMemo
                        });
                        setBrokerageMemoEditMode(false);
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#4CAF50',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      저장
                    </button>
                    <button
                      onClick={() => {
                        setEditingBrokerageMemo(selectedContract.brokerageMemo || '');
                        setBrokerageMemoEditMode(false);
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#999',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDoubleClick={() => setBrokerageMemoEditMode(true)}
                  style={{
                    fontSize: '13px',
                    color: selectedContract.brokerageMemo ? '#333' : '#999',
                    padding: '10px',
                    backgroundColor: '#fffbe6',
                    borderRadius: '4px',
                    borderLeft: '3px solid #FF9800',
                    minHeight: '80px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: '1.5',
                    cursor: 'text',
                    userSelect: 'none'
                  }}
                >
                  {selectedContract.brokerageMemo || '중개보수 관련 메모 (더블클릭으로 편집)'}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === '연장관리' && (
          <>
            <section style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '15px', color: '#1a1a1a', borderBottom: '2px solid #2196F3', paddingBottom: '8px', margin: '0 0 15px 0' }}>
                📅 만기관리 상태
              </h4>

              {/* 버튼 그리드 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                {CONTRACT_EXPIRY_MANAGEMENT.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      if (tempExpiryManagement === status) {
                        setTempExpiryManagement('');
                      } else {
                        setTempExpiryManagement(status);
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      backgroundColor: tempExpiryManagement === status ? '#2196F3' : '#e0e0e0',
                      color: tempExpiryManagement === status ? 'white' : '#666',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* 저장 버튼 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSaveExpiryManagement}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#45a049';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#4CAF50';
                  }}
                >
                  저장
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      {/* 버튼 영역 */}
      <div className="panel-footer" style={{ padding: '15px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '10px', justifyContent: 'flex-end', backgroundColor: '#fff' }}>
        <button
          onClick={() => onEdit(selectedContract)}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#2196F3', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          수정
        </button>
        <button
          onClick={() => onDelete(selectedContract)}
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          삭제
        </button>
      </div>
    </aside>
  );
};

export default ContractDetailPanel;
