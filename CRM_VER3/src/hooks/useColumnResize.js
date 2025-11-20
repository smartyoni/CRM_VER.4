import React, { useState, useEffect, useRef } from 'react';

/**
 * defaultColumns의 해시값을 생성하여 변경 감지
 */
const generateColumnsHash = (columns) => {
  const columnsStr = JSON.stringify(columns.map(col => ({ id: col.id, width: col.width })));
  let hash = 0;
  for (let i = 0; i < columnsStr.length; i++) {
    const char = columnsStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
};

/**
 * 테이블 컬럼 리사이징 커스텀 훅
 * @param {string} tableId - localStorage 키 생성용 테이블 고유 ID (예: 'customer', 'contract')
 * @param {Array} defaultColumns - 기본 컬럼 너비 배열 [{id, width}]
 * @returns {Object} { columnWidths, resizingColumn, ResizeHandle }
 */
export const useColumnResize = (tableId, defaultColumns) => {
  // 현재 defaultColumns의 해시값
  const currentHash = generateColumnsHash(defaultColumns);
  const hashKey = `table_columns_hash_${tableId}`;
  const widthsKey = `table_columns_${tableId}`;

  // localStorage에서 저장된 너비 불러오기
  const [columnWidths, setColumnWidths] = useState(() => {
    const savedHash = localStorage.getItem(hashKey);
    const saved = localStorage.getItem(widthsKey);

    // 저장된 해시값이 현재 해시값과 일치하면 저장된 너비 사용
    if (savedHash === currentHash && saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved column widths:', e);
      }
    }

    // 해시값이 다르면 (컬럼 구조가 변경됨) 새 defaultColumns 기반 초기화
    if (savedHash !== currentHash) {
      localStorage.setItem(hashKey, currentHash);
    }

    // 기본값 반환
    return defaultColumns.reduce((acc, col) => {
      acc[col.id] = col.width;
      return acc;
    }, {});
  });

  const [resizingColumn, setResizingColumn] = useState(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // 마우스 다운 핸들러
  const handleMouseDown = (e, columnId, currentWidth) => {
    e.preventDefault();
    e.stopPropagation(); // 정렬 이벤트 방지
    setResizingColumn(columnId);
    startX.current = e.clientX;
    startWidth.current = currentWidth;
  };

  // 마우스 무브 & 업 핸들러
  useEffect(() => {
    if (!resizingColumn) return;

    const handleMouseMove = (e) => {
      const delta = e.clientX - startX.current;
      const newWidth = Math.max(50, startWidth.current + delta); // 최소 50px

      setColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: newWidth
      }));
    };

    const handleMouseUp = () => {
      if (resizingColumn) {
        // localStorage에 저장 (해시값과 함께)
        setColumnWidths(prev => {
          localStorage.setItem(widthsKey, JSON.stringify(prev));
          localStorage.setItem(hashKey, currentHash);
          return prev;
        });
        setResizingColumn(null);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn, tableId]);

  // 리사이즈 핸들 컴포넌트
  const ResizeHandle = React.memo(({ columnId, currentWidth }) => {
    return React.createElement('div', {
      onMouseDown: (e) => handleMouseDown(e, columnId, currentWidth),
      style: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '5px',
        cursor: 'col-resize',
        backgroundColor: resizingColumn === columnId ? '#2196F3' : 'transparent',
        zIndex: 10,
        transition: 'background-color 0.2s'
      },
      onMouseEnter: (e) => {
        if (!resizingColumn) {
          e.currentTarget.style.backgroundColor = '#bdbdbd';
        }
      },
      onMouseLeave: (e) => {
        if (!resizingColumn) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }
    });
  });

  return {
    columnWidths,
    resizingColumn,
    ResizeHandle
  };
};
