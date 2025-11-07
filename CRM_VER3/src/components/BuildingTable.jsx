import React, { useState, useMemo } from 'react';
import { BUILDING_LOCATIONS, BUILDING_TYPES } from '../constants';

const BuildingTable = ({ buildings, onSelectBuilding, onEdit, onDelete, selectedBuildingId, activeFilter, onFilterChange, allBuildings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, selectedBuilding: null });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // 필터 옵션 추출
  const filterOptions = ['전체', ...new Set(allBuildings?.map(b => b.type).filter(Boolean) || [])];

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

  const TableHeader = ({ label, sortKey }) => (
    <th
      onClick={() => handleSort(sortKey)}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        padding: '12px',
        whiteSpace: 'nowrap',
        textAlign: 'left',
        fontWeight: '600'
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
      {/* 필터 드롭다운 */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select
          value={activeFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          {filterOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* 검색 바 */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="건물명이나 지번으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
          <table className="customer-table building-table" style={{ width: '100%', tableLayout: 'auto', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr>
                <TableHeader label="건물명" sortKey="name" />
                <TableHeader label="지번" sortKey="address" />
                <TableHeader label="공동현관비번" sortKey="entrance" />
                <TableHeader label="층수" sortKey="floors" />
                <TableHeader label="주차" sortKey="parking" />
                <TableHeader label="관리실번호" sortKey="office" />
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
                    if (selectedBuildingId === building.id) {
                      e.currentTarget.style.backgroundColor = '#e3f2fd';
                    } else {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f5f5f5';
                    }
                  }}
                >
                  <td className="building-fixed-width" style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                    {building.name || '-'}
                  </td>
                  <td className="building-fixed-width" style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                    {building.address || '-'}
                  </td>
                  <td className="building-entrance-width" style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                    {building.entrance || '-'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {building.floors || '-'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {building.parking || '-'}
                  </td>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
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
              onEdit(contextMenu.selectedBuilding);
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
              onDelete(contextMenu.selectedBuilding);
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

export default BuildingTable;
