import React, { useState, useMemo } from 'react';

const ContractTable = ({ contracts, onSelectContract, onEdit, onDelete, selectedContractId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, selectedContract: null });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const filteredContracts = useMemo(() => {
    let filtered = contracts.filter(contract =>
      contract.buildingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.roomNumber.includes(searchTerm) ||
      contract.contractorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 정렬 적용
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // null/undefined 처리
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // 숫자 비교 (계약금액)
      if (sortConfig.key === 'contractAmount') {
        const numA = Number(aValue) || 0;
        const numB = Number(bValue) || 0;
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      // 날짜 비교 (접수일, 계약일)
      if (sortConfig.key === 'createdAt' || sortConfig.key === 'contractDate') {
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

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 계약상태별 배경색
  const getStatusColor = (status) => {
    switch(status) {
      case '진행중': return '#e8f5e9';
      case '만료': return '#fff9c4';
      case '해지': return '#ffebee';
      default: return 'transparent';
    }
  };

  const TableHeader = ({ label, sortKey }) => (
    <th
      onClick={() => handleSort(sortKey)}
      style={{
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {label}
        {sortConfig.key === sortKey && (
          <span style={{ fontSize: '12px' }}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
        )}
      </div>
    </th>
  );

  return (
    <div className="property-table-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px' }}>
      {/* 검색 바 */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="건물명, 호실번호, 계약자명으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            flex: 1
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            초기화
          </button>
        )}
      </div>

      {/* 테이블 */}
      <div style={{ flex: 1, overflowX: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
        {filteredContracts.length > 0 ? (
          <table className="customer-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <TableHeader label="접수일" sortKey="createdAt" />
                <TableHeader label="건물명" sortKey="buildingName" />
                <TableHeader label="호실번호" sortKey="roomNumber" />
                <TableHeader label="계약일" sortKey="contractDate" />
                <TableHeader label="계약자명" sortKey="contractorName" />
                <TableHeader label="계약금액" sortKey="contractAmount" />
                <TableHeader label="상태" sortKey="contractStatus" />
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract, index) => (
                <tr
                  key={contract.id}
                  onClick={() => onSelectContract(contract)}
                  onContextMenu={(e) => handleContextMenu(e, contract)}
                  style={{
                    backgroundColor: getStatusColor(contract.contractStatus),
                    cursor: 'pointer',
                    borderBottom: '1px solid #e0e0e0',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedContractId !== contract.id) {
                      e.currentTarget.style.backgroundColor = '#dcfce7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = getStatusColor(contract.contractStatus);
                  }}
                >
                  <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {contract.createdAt ? contract.createdAt.split('T')[0] : '-'}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {contract.buildingName || '-'}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {contract.roomNumber || '-'}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {contract.contractDate || '-'}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {contract.contractorName || '-'}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {contract.contractAmount ? `${contract.contractAmount.toLocaleString()}만원` : '-'}
                  </td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {contract.contractStatus || '-'}
                  </td>
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

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="context-menu"
          onClick={handleCloseContextMenu}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '120px'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(contextMenu.selectedContract);
              handleCloseContextMenu();
            }}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px',
              color: '#333',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            수정
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(contextMenu.selectedContract);
              handleCloseContextMenu();
            }}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px',
              color: '#f44336',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
};

export default ContractTable;
