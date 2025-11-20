import React, { useState, useMemo } from 'react';
import { useColumnResize } from '../hooks/useColumnResize';

const ContractTable = ({
  contracts,
  onSelectContract,
  onEdit,
  onDelete,
  selectedContractId,
  onCloseDetailPanel,
  activeFilter = '전체'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, selectedContract: null });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // 컬럼 리사이징 (12개 컬럼)
  const defaultColumns = [
    { id: 'progressStatus', width: 100 },
    { id: 'buildingName', width: 150 },
    { id: 'contractDate', width: 130 },
    { id: 'balanceDate', width: 130 },
    { id: 'expiryDate', width: 130 },
    { id: 'landlordName', width: 150 },
    { id: 'landlordPhone', width: 140 },
    { id: 'tenantName', width: 150 },
    { id: 'tenantPhone', width: 140 },
    { id: 'remainderPaymentDate', width: 130 },
    { id: 'brokerageFee', width: 130 },
    { id: 'feeStatus', width: 150 }
  ];
  const { columnWidths, ResizeHandle } = useColumnResize('contract', defaultColumns);

  // 날짜 포맷팅 함수
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
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
      if (
        sortConfig.key === 'createdAt' ||
        sortConfig.key === 'contractDate' ||
        sortConfig.key === 'balanceDate' ||
        sortConfig.key === 'expiryDate'
      ) {
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
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
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

  const handleEdit = () => {
    if (contextMenu.selectedContract) {
      onEdit(contextMenu.selectedContract);
      handleCloseContextMenu();
    }
  };

  const handleDelete = () => {
    if (contextMenu.selectedContract && confirm('이 계약호실을 삭제하겠습니까?')) {
      onDelete(contextMenu.selectedContract);
      handleCloseContextMenu();
    }
  };

  // TableHeader 컴포넌트
  const TableHeader = ({ column, label, className, columnId }) => (
    <th
      className={className}
      onClick={() => handleSort(column)}
      style={{
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        padding: '12px',
        whiteSpace: 'nowrap',
        textAlign: 'left',
        fontWeight: '600',
        width: columnWidths[columnId],
        minWidth: '50px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {label}
        {sortConfig.key === column && (
          <span style={{ fontSize: '12px' }}>
            {sortConfig.direction === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </div>
      <ResizeHandle columnId={columnId} currentWidth={columnWidths[columnId]} />
    </th>
  );

  return (
    <div className="property-table-container" style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      padding: '20px'
    }}>
      {/* 검색 바 */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="건물명, 호실명, 임차인이름, 임대인이름으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => onCloseDetailPanel && onCloseDetailPanel()}
          style={{
            width: '100%',
            padding: '8px 12px',
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

      {/* 테이블 */}
      <div style={{ flex: 1, overflowX: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
        {filteredContracts.length > 0 ? (
          <table className="customer-table" style={{ width: '100%', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <TableHeader column="progressStatus" label="진행상황" columnId="progressStatus" />
                <th className="col-text-standard" style={{ position: 'relative', padding: '12px', whiteSpace: 'nowrap', textAlign: 'left', fontWeight: '600', width: columnWidths['buildingName'], minWidth: '50px' }}>
                  계약호실명
                  <ResizeHandle columnId="buildingName" currentWidth={columnWidths['buildingName']} />
                </th>
                <TableHeader column="contractDate" label="계약서작성일" className="col-date-standard" columnId="contractDate" />
                <TableHeader column="balanceDate" label="잔금일" className="col-date-standard" columnId="balanceDate" />
                <TableHeader column="expiryDate" label="만기일" className="col-date-standard" columnId="expiryDate" />
                <TableHeader column="landlordName" label="임대인이름" className="col-text-standard" columnId="landlordName" />
                <th className="col-phone-standard" style={{ position: 'relative', padding: '12px', whiteSpace: 'nowrap', textAlign: 'left', fontWeight: '600', width: columnWidths['landlordPhone'], minWidth: '50px' }}>
                  임대인번호
                  <ResizeHandle columnId="landlordPhone" currentWidth={columnWidths['landlordPhone']} />
                </th>
                <TableHeader column="tenantName" label="임차인이름" className="col-text-standard" columnId="tenantName" />
                <th className="col-phone-standard" style={{ position: 'relative', padding: '12px', whiteSpace: 'nowrap', textAlign: 'left', fontWeight: '600', width: columnWidths['tenantPhone'], minWidth: '50px' }}>
                  임차인번호
                  <ResizeHandle columnId="tenantPhone" currentWidth={columnWidths['tenantPhone']} />
                </th>
                <TableHeader column="remainderPaymentDate" label="입금일" className="col-date-standard" columnId="remainderPaymentDate" />
                <TableHeader column="brokerageFee" label="중개보수(원)" className="col-number-standard" columnId="brokerageFee" />
                <TableHeader column="feeStatus" label="입금상태" className="col-expand" columnId="feeStatus" />
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract, index) => (
                <tr
                  key={contract.id}
                  onClick={() => onSelectContract(contract)}
                  onContextMenu={(e) => handleContextMenu(e, contract)}
                  style={{
                    backgroundColor: selectedContractId === contract.id
                      ? '#e3f2fd'
                      : index % 2 === 0 ? '#ffffff' : '#f5f5f5',
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
                    if (selectedContractId !== contract.id) {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f5f5f5';
                    }
                  }}
                >
                  <td style={{ padding: '12px' }}>{contract.progressStatus || '-'}</td>
                  <td className="col-text-standard" style={{ padding: '12px', fontWeight: 'bold' }}>
                    {contract.buildingName && contract.roomName
                      ? `${contract.buildingName} ${contract.roomName}`
                      : '-'}
                  </td>
                  <td className="col-date-standard" style={{ padding: '12px' }}>{formatDate(contract.contractDate)}</td>
                  <td className="col-date-standard" style={{ padding: '12px' }}>{formatDate(contract.balanceDate)}</td>
                  <td className="col-date-standard" style={{ padding: '12px' }}>{formatDate(contract.expiryDate)}</td>
                  <td className="col-text-standard" style={{ padding: '12px' }}>{contract.landlordName || '-'}</td>
                  <td className="col-phone-standard" style={{ padding: '12px' }}>
                    {contract.landlordPhone ? (
                      <a href={`sms:${contract.landlordPhone}`} style={{ color: '#2196F3', textDecoration: 'none' }}>
                        {contract.landlordPhone}
                      </a>
                    ) : '-'}
                  </td>
                  <td className="col-text-standard" style={{ padding: '12px' }}>{contract.tenantName || '-'}</td>
                  <td className="col-phone-standard" style={{ padding: '12px' }}>
                    {contract.tenantPhone ? (
                      <a href={`sms:${contract.tenantPhone}`} style={{ color: '#2196F3', textDecoration: 'none' }}>
                        {contract.tenantPhone}
                      </a>
                    ) : '-'}
                  </td>
                  <td className="col-date-standard" style={{ padding: '12px' }}>{formatDate(contract.remainderPaymentDate)}</td>
                  <td className="col-number-standard" style={{ padding: '12px', textAlign: 'right' }}>
                    {contract.brokerageFee ? Number(contract.brokerageFee).toLocaleString() : '-'}
                  </td>
                  <td className="col-expand" style={{ padding: '12px' }}>{contract.feeStatus || '-'}</td>
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
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998
            }}
            onClick={handleCloseContextMenu}
          />
          <div
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 999,
              minWidth: '120px'
            }}
          >
            <button
              onClick={handleEdit}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#333',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#d32f2f',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#ffebee'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
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
