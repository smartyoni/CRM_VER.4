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

  useEffect(() => {
    setSelectedProgressStatus(selectedContract?.progressStatus || '');
    setSelectedPropertyManagement(selectedContract?.propertyManagement || '');
    setSelectedExpiryManagement(selectedContract?.expiryManagement || '');
    setEditingMemo(selectedContract?.memo || '');
    setMemoEditMode(false);
    setActiveTab('기본정보');

    // 입금일이 비어있을 때 잔금일로 자동 설정
    if (selectedContract && !selectedContract.remainderPaymentDate && selectedContract.balanceDate) {
      const updatedContract = {
        ...selectedContract,
        remainderPaymentDate: selectedContract.balanceDate
      };
      onUpdateContract(updatedContract);
    }
  }, [selectedContract]);

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
            {selectedContract.tenantName || '-'}
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
        {['기본정보', '중개보수', '연장관리'].map((tab) => (
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

        {activeTab === '중개보수' && (
          <>
            {/* 계산 버튼 */}
            <div style={{ marginBottom: '15px' }}>
              <button
                onClick={() => {
                  // 계산기 열 때 기본정보에서 보증금과 월세 자동 입력
                  if (!isCalculatorOpen) {
                    if (selectedContract.deposit) {
                      setCalcDeposit(Math.floor(selectedContract.deposit / 10000).toString());
                    }
                    if (selectedContract.monthlyRent) {
                      setCalcMonthlyRent(Math.floor(selectedContract.monthlyRent / 10000).toString());
                    }
                  }
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
                      {Number(calculatedFee).toLocaleString()} 만원
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
                  <span style={{ fontWeight: '600', color: '#666' }}>중개보수금액:</span>
                  <span style={{ color: '#333' }}>
                    {selectedContract.brokerageFee ?
                      `${(Number(selectedContract.brokerageFee) / 10000).toLocaleString()} 만원 (${Number(selectedContract.brokerageFee).toLocaleString()} 원)`
                      : '미입력'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
                  <span style={{ fontWeight: '600', color: '#666' }}>입금일:</span>
                  <span style={{ color: '#333' }}>{formatDate(selectedContract.remainderPaymentDate)}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '100px auto', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: '#666' }}>입금상태:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        const updated = { ...selectedContract, feeStatus: '입금됨' };
                        onUpdateContract(updated);
                      }}
                      style={{
                        padding: '5px 10px',
                        fontSize: '12px',
                        backgroundColor: selectedContract.feeStatus === '입금됨' ? '#4CAF50' : '#e0e0e0',
                        color: selectedContract.feeStatus === '입금됨' ? 'white' : '#666',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      입금됨
                    </button>
                    <button
                      onClick={() => {
                        const updated = { ...selectedContract, feeStatus: '미입금' };
                        onUpdateContract(updated);
                      }}
                      style={{
                        padding: '5px 10px',
                        fontSize: '12px',
                        backgroundColor: selectedContract.feeStatus === '미입금' ? '#f44336' : '#e0e0e0',
                        color: selectedContract.feeStatus === '미입금' ? 'white' : '#666',
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
              <div style={{
                fontSize: '13px',
                color: selectedContract.brokerageMemo ? '#333' : '#999',
                padding: '10px',
                backgroundColor: '#fffbe6',
                borderRadius: '4px',
                borderLeft: '3px solid #FF9800',
                minHeight: '80px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: '1.5'
              }}>
                {selectedContract.brokerageMemo || '중개보수 관련 메모'}
              </div>
            </section>
          </>
        )}

        {activeTab === '연장관리' && (
          <>
            <section>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #FF9800' }}>
                🔄 연장 히스토리
              </h4>

              {selectedContract.extensionHistory && selectedContract.extensionHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedContract.extensionHistory.map((ext, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      backgroundColor: '#fff3e0',
                      borderRadius: '4px',
                      borderLeft: '3px solid #FF9800'
                    }}>
                      <div style={{ fontSize: '13px', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                        연장 #{index + 1}
                      </div>
                      <div style={{ fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '600', color: '#666' }}>연장일:</span> {formatDate(ext.extensionDate)}
                      </div>
                      <div style={{ fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '600', color: '#666' }}>새 만기일:</span> {formatDate(ext.newExpiryDate)}
                      </div>
                      <div style={{ fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '600', color: '#666' }}>연장기간:</span> {ext.extensionPeriod}개월
                      </div>
                      {ext.memo && (
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 152, 0, 0.3)' }}>
                          <span style={{ fontWeight: '600' }}>메모:</span> {ext.memo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  fontSize: '13px',
                  color: '#999',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px'
                }}>
                  연장 히스토리가 없습니다
                </div>
              )}
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
