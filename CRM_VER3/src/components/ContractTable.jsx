import React, { useState, useMemo } from 'react';

const ContractTable = ({ contracts, onSelectContract, onEdit, onDelete, selectedContractId, onCloseDetailPanel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, selectedContract: null });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [dateField, setDateField] = useState('contractDate');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const filteredContracts = useMemo(() => {
    let filtered = contracts.filter(contract => {
      // 텍스트 검색 필터
      const matchesText = searchTerm === '' ||
        contract.buildingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.landlordName.toLowerCase().includes(searchTerm.toLowerCase());

      // 날짜 범위 검색 필터
      let matchesDateRange = true;
      if (startDate || endDate) {
        const contractDateValue = contract[dateField];
        if (contractDateValue) {
          const contractDate = new Date(contractDateValue);
          contractDate.setHours(0, 0, 0, 0);

          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (contractDate < start) matchesDateRange = false;
          }

          if (endDate && matchesDateRange) {
            const end = new Date(endDate);
            end.setHours(0, 0, 0, 0);
            if (contractDate > end) matchesDateRange = false;
          }
        } else {
          matchesDateRange = false;
        }
      }

      return matchesText && matchesDateRange;
    });

    // 정렬 적용
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // null/undefined 처리
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // 날짜 비교 (ISO 형식 또는 YYYY-MM-DD 문자열)
      if (sortConfig.key === 'createdAt' || sortConfig.key === 'contractDate' ||
          sortConfig.key === 'balanceDate' || sortConfig.key === 'expiryDate') {
        // YYYY-MM-DD 형식 문자열인 경우 직접 비교 (사전식 정렬)
        if (typeof aValue === 'string' && typeof bValue === 'string' &&
            /^\d{4}-\d{2}-\d{2}$/.test(aValue) && /^\d{4}-\d{2}-\d{2}$/.test(bValue)) {
          return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        // 그 외의 경우 Date 객체로 변환
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      // 문자열 비교
      const strA = String(aValue).toLowerCase();
      const strB = String(bValue).toLowerCase();

      if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [contracts, searchTerm, sortConfig, dateField, startDate, endDate]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleContextMenu = (e, contract) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      selectedContract: contract
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, selectedContract: null });
  };

  const columnConfigs = {
    progressStatus: { width: '80px' },
    buildingName: { width: '200px' },
    contractDate: { width: '95px' },
    balanceDate: { width: '95px' },
    expiryDate: { width: '95px' },
    landlordName: { width: '100px' },
    landlordPhone: { width: '120px' },
    tenantName: { width: '100px' },
    tenantPhone: { width: '120px' },
    remainderPaymentDate: { width: '95px' },
    brokerageFee: { width: '130px' },
    feeStatus: { width: '90px' }
  };

  const cellStyle = (column) => ({
    padding: '12px',
    width: columnConfigs[column]?.width,
    minWidth: columnConfigs[column]?.width,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  });

  const dateColumnStyle = (column) => ({
    padding: '12px',
    width: columnConfigs[column]?.width,
    minWidth: columnConfigs[column]?.width,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'center'
  });

  const SortHeader = ({ column, label, isDateColumn = false }) => (
    <th
      onClick={() => handleSort(column)}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        padding: '12px',
        width: columnConfigs[column]?.width,
        minWidth: columnConfigs[column]?.width,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textAlign: isDateColumn ? 'center' : 'left'
      }}
    >
      {label}
      {sortConfig.key === column && (
        <span style={{ marginLeft: '8px' }}>
          {sortConfig.direction === 'asc' ? '▲' : '▼'}
        </span>
      )}
    </th>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 검색 바 */}
      <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* 텍스트 검색 */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="건물명, 호실명, 임차인이름, 임대인이름으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => onCloseDetailPanel && onCloseDetailPanel()}
            style={{
              width: '100%',
              padding: '10px 12px',
              paddingRight: searchTerm ? '36px' : '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#999',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="검색 초기화"
            >
              ✕
            </button>
          )}
        </div>

        {/* 날짜 범위 검색 */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={dateField}
            onChange={(e) => setDateField(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: '#fff'
            }}
          >
            <option value="contractDate">계약서작성일</option>
            <option value="balanceDate">잔금일</option>
            <option value="expiryDate">만기일</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />

          <span style={{ fontSize: '14px', fontWeight: '500' }}>~</span>

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />

          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              style={{
                padding: '10px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 테이블 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredContracts.length > 0 ? (
          <table className="customer-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                <SortHeader column="progressStatus" label="진행상황" />
                <SortHeader column="buildingName" label="계약호실명" />
                <SortHeader column="contractDate" label="계약서작성일" isDateColumn={true} />
                <SortHeader column="balanceDate" label="잔금일" isDateColumn={true} />
                <SortHeader column="expiryDate" label="만기일" isDateColumn={true} />
                <SortHeader column="landlordName" label="임대인이름" />
                <SortHeader column="landlordPhone" label="임대인번호" />
                <SortHeader column="tenantName" label="임차인이름" />
                <SortHeader column="tenantPhone" label="임차인번호" />
                <SortHeader column="remainderPaymentDate" label="입금일" isDateColumn={true} />
                <SortHeader column="brokerageFee" label="중개보수금액(원)" />
                <SortHeader column="feeStatus" label="입금상태" />
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract, index) => (
                <tr
                  key={contract.id}
                  onClick={() => onSelectContract(contract)}
                  onContextMenu={(e) => handleContextMenu(e, contract)}
                  style={{
                    backgroundColor: selectedContractId === contract.id ? '#e3f2fd' : index % 2 === 0 ? '#ffffff' : '#f5f5f5',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedContractId !== contract.id) {
                      e.currentTarget.style.backgroundColor = '#dcfce7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = selectedContractId === contract.id ? '#e3f2fd' : index % 2 === 0 ? '#ffffff' : '#f5f5f5';
                  }}
                >
                  <td style={{ ...cellStyle('progressStatus'), textAlign: 'left', paddingLeft: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '3px',
                      fontSize: '13px',
                      fontWeight: '600',
                      backgroundColor:
                        contract.progressStatus === '계약서작성' ? '#c8e6c9' :
                        contract.progressStatus === '잔금' ? '#ffcccc' :
                        contract.progressStatus === '입주완료' ? '#bbdefb' :
                        '#e0e0e0',
                      color:
                        contract.progressStatus === '계약서작성' ? '#2e7d32' :
                        contract.progressStatus === '잔금' ? '#c62828' :
                        contract.progressStatus === '입주완료' ? '#1565c0' :
                        '#666',
                      display: 'inline-block',
                      minWidth: '70px',
                      textAlign: 'center'
                    }}>
                      {contract.progressStatus || '-'}
                    </span>
                  </td>
                  <td style={cellStyle('buildingName')}>{contract.buildingName && contract.roomName ? `${contract.buildingName} ${contract.roomName}` : '-'}</td>
                  <td style={dateColumnStyle('contractDate')}>{formatDate(contract.contractDate)}</td>
                  <td style={dateColumnStyle('balanceDate')}>{formatDate(contract.balanceDate)}</td>
                  <td style={dateColumnStyle('expiryDate')}>{formatDate(contract.expiryDate)}</td>
                  <td style={cellStyle('landlordName')}>{contract.landlordName || '-'}</td>
                  <td style={cellStyle('landlordPhone')}>
                    {contract.landlordPhone ? (
                      <a href={`sms:${contract.landlordPhone}`} style={{ color: '#2196F3', textDecoration: 'none', cursor: 'pointer' }}>
                        {contract.landlordPhone}
                      </a>
                    ) : '-'}
                  </td>
                  <td style={cellStyle('tenantName')}>{contract.tenantName || '-'}</td>
                  <td style={cellStyle('tenantPhone')}>
                    {contract.tenantPhone ? (
                      <a href={`sms:${contract.tenantPhone}`} style={{ color: '#2196F3', textDecoration: 'none', cursor: 'pointer' }}>
                        {contract.tenantPhone}
                      </a>
                    ) : '-'}
                  </td>
                  <td style={dateColumnStyle('remainderPaymentDate')}>{formatDate(contract.remainderPaymentDate)}</td>
                  <td style={{ ...cellStyle('brokerageFee'), textAlign: 'right' }}>
                    {contract.brokerageFee ? Number(contract.brokerageFee).toLocaleString() : '-'}
                  </td>
                  <td style={{ ...cellStyle('feeStatus'), textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '3px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: contract.feeStatus === '입금됨' ? '#c8e6c9' : '#ffcccc',
                      color: contract.feeStatus === '입금됨' ? '#2e7d32' : '#c62828'
                    }}>
                      {contract.feeStatus || '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            {searchTerm || startDate || endDate ? '검색 결과가 없습니다' : '등록된 계약호실이 없습니다'}
          </div>
        )}
      </div>

      {/* 컨텍스트 메뉴 */}
      {contextMenu.visible && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 998
            }}
            onClick={handleCloseContextMenu}
          />
          <div
            style={{
              position: 'fixed',
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 999,
              minWidth: '120px'
            }}
          >
            <button
              onClick={() => {
                onEdit(contextMenu.selectedContract);
                handleCloseContextMenu();
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              수정
            </button>
            <button
              onClick={() => {
                onDelete(contextMenu.selectedContract);
                handleCloseContextMenu();
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#f44336',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffebee'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              삭제
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ContractTable;
