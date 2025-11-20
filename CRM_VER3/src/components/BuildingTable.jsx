import React, { useState, useMemo } from 'react';
import { useColumnResize } from '../hooks/useColumnResize';

const BuildingTable = ({ buildings, onSelectBuilding, onEdit, onDelete, selectedBuildingId, onCloseDetailPanel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, selectedBuilding: null });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'desc' });

  // 컬럼 리사이징
  const defaultColumns = [
    { id: 'name', width: 180 },
    { id: 'address', width: 250 },
    { id: 'entrance', width: 150 },
    { id: 'floors', width: 100 },
    { id: 'parking', width: 100 },
    { id: 'office', width: 140 }
  ];
  const { columnWidths, ResizeHandle } = useColumnResize('building', defaultColumns);

  const filteredBuildings = useMemo(() => {
    let filtered = buildings.filter(building =>
      building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 정렬 적용
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // null/undefined 처리
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // 숫자 비교
      if (sortConfig.key === 'floors' || sortConfig.key === 'parking' || sortConfig.key === 'units') {
        const numA = Number(aValue) || 0;
        const numB = Number(bValue) || 0;
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      // 날짜 비교
      if (sortConfig.key === 'createdAt' || sortConfig.key === 'approvalDate') {
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
  }, [buildings, searchTerm, sortConfig]);

  const handleContextMenu = (e, building) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      selectedBuilding: building
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, selectedBuilding: null });
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const TableHeader = ({ label, sortKey, className, columnId }) => (
    <th
      className={className}
      onClick={() => handleSort(sortKey)}
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
        {sortConfig.key === sortKey && (
          <span style={{ fontSize: '12px' }}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
        )}
      </div>
      <ResizeHandle columnId={columnId} currentWidth={columnWidths[columnId]} />
    </th>
  );

  return (
    <div className="property-table-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px' }}>
      {/* 검색 바 */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="건물명이나 지번으로 검색..."
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

<div style={{ flex: 1, overflowX: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
        {filteredBuildings.length > 0 ? (
          <table className="customer-table building-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr>
                <TableHeader label="건물명" sortKey="name" className="col-text-standard" columnId="name" />
                <TableHeader label="지번" sortKey="address" className="col-text-standard" columnId="address" />
                <th style={{ position: 'relative', padding: '12px', whiteSpace: 'nowrap', textAlign: 'left', fontWeight: '600', width: columnWidths['entrance'], minWidth: '50px' }}>
                  공동현관비번
                  <ResizeHandle columnId="entrance" currentWidth={columnWidths['entrance']} />
                </th>
                <th style={{ position: 'relative', padding: '12px', whiteSpace: 'nowrap', textAlign: 'left', fontWeight: '600', width: columnWidths['floors'], minWidth: '50px' }}>
                  층수
                  <ResizeHandle columnId="floors" currentWidth={columnWidths['floors']} />
                </th>
                <th style={{ position: 'relative', padding: '12px', whiteSpace: 'nowrap', textAlign: 'left', fontWeight: '600', width: columnWidths['parking'], minWidth: '50px' }}>
                  주차
                  <ResizeHandle columnId="parking" currentWidth={columnWidths['parking']} />
                </th>
                <TableHeader label="관리실번호" sortKey="office" className="col-phone-standard col-expand" columnId="office" />
              </tr>
            </thead>
            <tbody>
              {filteredBuildings.map((building, index) => (
                <tr
                  key={building.id}
                  onClick={() => onSelectBuilding(building)}
                  onContextMenu={(e) => handleContextMenu(e, building)}
                  style={{
                    backgroundColor: selectedBuildingId === building.id ? '#e3f2fd' : index % 2 === 0 ? '#ffffff' : '#f5f5f5',
                    cursor: 'pointer',
                    borderBottom: '1px solid #e0e0e0',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedBuildingId !== building.id) {
                      e.currentTarget.style.backgroundColor = '#dcfce7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedBuildingId !== building.id) {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f5f5f5';
                    }
                  }}
                >
                  <td className="col-text-standard">
                    {building.name || '-'}
                  </td>
                  <td className="col-text-standard">
                    {building.address || '-'}
                  </td>
                  <td className="col-text-standard">
                    {building.entrance || '-'}
                  </td>
                  <td className="col-number-standard">
                    {building.floors || '-'}
                  </td>
                  <td className="col-number-standard">
                    {building.parking || '-'}
                  </td>
                  <td className="col-phone-standard col-expand">
                    {building.office ? (
                      <a href={`sms:${building.office}`} style={{ color: '#2196F3', textDecoration: 'none', cursor: 'pointer' }}>
                        {building.office}
                      </a>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            {searchTerm ? '검색 결과가 없습니다' : '등록된 건물이 없습니다'}
          </div>
        )}
      </div>

      {/* Context Menu */}
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
              onClick={() => {
                onEdit(contextMenu.selectedBuilding);
                handleCloseContextMenu();
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
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
              onClick={() => {
                onDelete(contextMenu.selectedBuilding);
                handleCloseContextMenu();
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
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

export default BuildingTable;
