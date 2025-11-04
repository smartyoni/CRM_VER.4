import React, { useState, useMemo } from 'react';

const ContractTable = ({ contracts, onSelectContract, onEdit, onDelete, selectedContractId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, selectedContract: null });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

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
    let filtered = contracts.filter(contract =>
      contract.buildingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.landlordName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 정렬 적용
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // null/undefined 처리
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // 날짜 비교
      if (sortConfig.key === 'createdAt' || sortConfig.key === 'contractDate' ||
          sortConfig.key === 'balanceDate' || sortConfig.key === 'expiryDate') {
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
  }, [contracts, searchTerm, sortConfig]);

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
    buildingName: { width: '200px' },
    contractDate: { width: '120px' },
    balanceDate: { width: '120px' },
    expiryDate: { width: '120px' },
    landlordName: { width: '100px' },
    landlordPhone: { width: '120px' },
    tenantName: { width: '100px' },
    tenantPhone: { width: '120px' }
  };

  const cellStyle = (column) => ({
    padding: '12px',
    width: columnConfigs[column]?.width,
    minWidth: columnConfigs[column]?.width,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  });

  const SortHeader = ({ column, label }) => (
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
        textOverflow: 'ellipsis'
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
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="건물명, 호실명, 임차인이름, 임대인이름으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
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

      {/* 테이블 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredContracts.length > 0 ? (
          <table className="customer-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                <SortHeader column="buildingName" label="계약호실명" />
                <SortHeader column="contractDate" label="계약서작성일" />
                <SortHeader column="balanceDate" label="잔금일" />
                <SortHeader column="expiryDate" label="만기일" />
                <SortHeader column="landlordName" label="임대인이름" />
                <SortHeader column="landlordPhone" label="임대인번호" />
                <SortHeader column="tenantName" label="임차인이름" />
                <SortHeader column="tenantPhone" label="임차인번호" />
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
                  <td style={cellStyle('buildingName')}>{contract.buildingName && contract.roomName ? `${contract.buildingName} ${contract.roomName}` : '-'}</td>
                  <td style={cellStyle('contractDate')}>{formatDate(contract.contractDate)}</td>
                  <td style={cellStyle('balanceDate')}>{formatDate(contract.balanceDate)}</td>
                  <td style={cellStyle('expiryDate')}>{formatDate(contract.expiryDate)}</td>
                  <td style={cellStyle('landlordName')}>{contract.landlordName || '-'}</td>
                  <td style={cellStyle('landlordPhone')}>{contract.landlordPhone || '-'}</td>
                  <td style={cellStyle('tenantName')}>{contract.tenantName || '-'}</td>
                  <td style={cellStyle('tenantPhone')}>{contract.tenantPhone || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            {searchTerm ? '검색 결과가 없습니다' : '등록된 계약호실이 없습니다'}
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
