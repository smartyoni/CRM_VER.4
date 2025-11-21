import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

const TABLES_METADATA_COLLECTION = 'tables';

// ========== 테이블 메타데이터 Functions ==========

// 모든 테이블 메타데이터 조회
export const getTables = async () => {
  try {
    const snapshot = await getDocs(collection(db, TABLES_METADATA_COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching tables:', error);
    return [];
  }
};

// 테이블 메타데이터 저장 (생성 또는 업데이트)
export const saveTable = async (tableData) => {
  try {
    const id = tableData.id || `table_${Date.now()}`;
    const dataToSave = {
      ...tableData,
      id,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, TABLES_METADATA_COLLECTION, id), dataToSave);
    return id;
  } catch (error) {
    console.error('Error saving table:', error);
    throw error;
  }
};

// 테이블 메타데이터 삭제
export const deleteTable = async (tableId) => {
  try {
    // 메타데이터 삭제
    await deleteDoc(doc(db, TABLES_METADATA_COLLECTION, tableId));

    // 해당 테이블의 모든 데이터 삭제
    const dataSnapshot = await getDocs(collection(db, tableId));
    const deletePromises = dataSnapshot.docs.map(doc =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting table:', error);
    throw error;
  }
};

// 테이블 메타데이터 실시간 구독
export const subscribeToTables = (callback) => {
  return onSnapshot(collection(db, TABLES_METADATA_COLLECTION), (snapshot) => {
    const tables = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(tables);
  }, (error) => {
    console.error('Error in tables subscription:', error);
  });
};

// 테이블 컬럼의 required 속성 업데이트 (마이그레이션용)
export const updateTableColumnRequired = async (tableId, columnName, required) => {
  try {
    const tableRef = doc(db, TABLES_METADATA_COLLECTION, tableId);
    const tableDoc = await getDoc(tableRef);

    if (!tableDoc.exists()) {
      throw new Error('테이블을 찾을 수 없습니다.');
    }

    const tableData = tableDoc.data();
    const updatedColumns = (tableData.columns || []).map(col => {
      if (col.name === columnName) {
        return { ...col, required };
      }
      return col;
    });

    await updateDoc(tableRef, { columns: updatedColumns });
  } catch (error) {
    console.error(`Error updating column ${columnName} required:`, error);
    throw error;
  }
};

// ========== 동적 테이블 데이터 Functions ==========

// 특정 테이블의 모든 데이터 조회
export const getTableData = async (tableId) => {
  try {
    const snapshot = await getDocs(collection(db, tableId));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching data from table ${tableId}:`, error);
    return [];
  }
};

// 테이블에 단일 행 저장 (생성 또는 업데이트)
export const saveTableRow = async (tableId, rowData) => {
  try {
    // 문서 ID 생성 및 sanitize (Firestore는 "/"를 포함할 수 없음)
    let id = rowData.id || `row_${Date.now()}`;
    // "/" 문자를 "_" 로 치환하여 문서 ID 안전성 확보
    id = id.replace(/\//g, '_').replace(/\\/g, '_');

    const dataToSave = {
      ...rowData,
      id,
      createdAt: rowData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, tableId, id), dataToSave);
    return id;
  } catch (error) {
    console.error(`Error saving row to table ${tableId}:`, error);
    throw error;
  }
};

// 테이블에 여러 행 저장 (CSV 임포트 등에 사용)
export const saveTableRows = async (tableId, rows) => {
  try {
    const promises = rows.map(row => saveTableRow(tableId, row));
    await Promise.all(promises);
  } catch (error) {
    console.error(`Error saving rows to table ${tableId}:`, error);
    throw error;
  }
};

// 테이블에서 특정 행 삭제
export const deleteTableRow = async (tableId, rowId) => {
  try {
    // 문서 ID sanitize (저장할 때와 동일하게)
    const sanitizedId = rowId.replace(/\//g, '_').replace(/\\/g, '_');
    await deleteDoc(doc(db, tableId, sanitizedId));
  } catch (error) {
    console.error(`Error deleting row from table ${tableId}:`, error);
    throw error;
  }
};

// 테이블 데이터 실시간 구독
export const subscribeToTableData = (tableId, callback) => {
  return onSnapshot(collection(db, tableId), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (error) => {
    console.error(`Error in table ${tableId} subscription:`, error);
  });
};

// ========== 테이블 구조 검증 ==========

// 행 데이터가 테이블 스키마와 일치하는지 검증
export const validateRowData = (rowData, columns) => {
  const errors = [];

  columns.forEach(column => {
    const value = rowData[column.name];

    // 필수 필드 검증
    if (column.required && (value === undefined || value === null || value === '')) {
      errors.push(`"${column.name}" 필드는 필수입니다.`);
      return;
    }

    // 데이터 타입 검증
    if (value !== undefined && value !== null && value !== '') {
      switch (column.type) {
        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`"${column.name}"은(는) 숫자여야 합니다.`);
          }
          break;
        case 'date':
          if (isNaN(Date.parse(value))) {
            errors.push(`"${column.name}"은(는) 유효한 날짜여야 합니다.`);
          }
          break;
        case 'text':
        default:
          // 텍스트는 항상 유효
          break;
      }
    }
  });

  return errors;
};

// ========== 컬럼 관리 ==========

// 기존 테이블에 새 컬럼 추가
export const addColumnToTable = async (tableId, newColumn) => {
  try {
    const table = await doc(db, TABLES_METADATA_COLLECTION, tableId);
    const existingTable = (await getDocs(query(collection(db, TABLES_METADATA_COLLECTION), where('id', '==', tableId)))).docs[0];

    if (!existingTable) {
      throw new Error('테이블을 찾을 수 없습니다.');
    }

    const columns = [...(existingTable.data().columns || []), newColumn];
    await updateDoc(table, { columns });
  } catch (error) {
    console.error('Error adding column:', error);
    throw error;
  }
};

// 테이블에서 컬럼 제거
export const removeColumnFromTable = async (tableId, columnName) => {
  try {
    const tables = await getDocs(collection(db, TABLES_METADATA_COLLECTION));
    const tableDoc = tables.docs.find(doc => doc.id === tableId);

    if (!tableDoc) {
      throw new Error('테이블을 찾을 수 없습니다.');
    }

    const columns = tableDoc.data().columns.filter(col => col.name !== columnName);
    await updateDoc(doc(db, TABLES_METADATA_COLLECTION, tableId), { columns });
  } catch (error) {
    console.error('Error removing column:', error);
    throw error;
  }
};
