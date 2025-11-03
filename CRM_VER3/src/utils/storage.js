import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Collection names
const CUSTOMERS_COLLECTION = 'customers';
const ACTIVITIES_COLLECTION = 'activities';
const MEETINGS_COLLECTION = 'meetings';
const PROPERTY_SELECTIONS_COLLECTION = 'propertySelections';
const PROPERTIES_COLLECTION = 'properties';
const BUILDINGS_COLLECTION = 'buildings';

// ========== Customer Functions ==========

export const getCustomers = async () => {
  try {
    const snapshot = await getDocs(collection(db, CUSTOMERS_COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export const saveCustomers = async (customers) => {
  try {
    const promises = customers.map(customer =>
      setDoc(doc(db, CUSTOMERS_COLLECTION, customer.id), customer)
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Error saving customers:', error);
  }
};

export const saveCustomer = async (customer) => {
  try {
    await setDoc(doc(db, CUSTOMERS_COLLECTION, customer.id), customer);
  } catch (error) {
    console.error('Error saving customer:', error);
  }
};

export const deleteCustomer = async (customerId) => {
  try {
    await deleteDoc(doc(db, CUSTOMERS_COLLECTION, customerId));
  } catch (error) {
    console.error('Error deleting customer:', error);
  }
};

// Realtime subscription for customers
export const subscribeToCustomers = (callback) => {
  return onSnapshot(collection(db, CUSTOMERS_COLLECTION), (snapshot) => {
    const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(customers);
  }, (error) => {
    console.error('Error in customers subscription:', error);
  });
};

// ========== Activity Functions ==========

export const getActivities = async () => {
  try {
    const snapshot = await getDocs(collection(db, ACTIVITIES_COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
};

export const saveActivities = async (activities) => {
  try {
    const promises = activities.map(activity =>
      setDoc(doc(db, ACTIVITIES_COLLECTION, activity.id), activity)
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Error saving activities:', error);
  }
};

export const saveActivity = async (activity) => {
  try {
    await setDoc(doc(db, ACTIVITIES_COLLECTION, activity.id), activity);
  } catch (error) {
    console.error('Error saving activity:', error);
  }
};

export const deleteActivity = async (activityId) => {
  try {
    await deleteDoc(doc(db, ACTIVITIES_COLLECTION, activityId));
  } catch (error) {
    console.error('Error deleting activity:', error);
  }
};

// Realtime subscription for activities
export const subscribeToActivities = (callback) => {
  return onSnapshot(collection(db, ACTIVITIES_COLLECTION), (snapshot) => {
    const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(activities);
  }, (error) => {
    console.error('Error in activities subscription:', error);
  });
};

// ========== Meeting Functions ==========

export const getMeetings = async () => {
  try {
    const snapshot = await getDocs(collection(db, MEETINGS_COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return [];
  }
};

export const saveMeetings = async (meetings) => {
  try {
    const promises = meetings.map(meeting =>
      setDoc(doc(db, MEETINGS_COLLECTION, meeting.id), meeting)
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Error saving meetings:', error);
  }
};

export const saveMeeting = async (meeting) => {
  try {
    await setDoc(doc(db, MEETINGS_COLLECTION, meeting.id), meeting);
  } catch (error) {
    console.error('Error saving meeting:', error);
  }
};

export const deleteMeeting = async (meetingId) => {
  try {
    await deleteDoc(doc(db, MEETINGS_COLLECTION, meetingId));
  } catch (error) {
    console.error('Error deleting meeting:', error);
  }
};

// Realtime subscription for meetings
export const subscribeToMeetings = (callback) => {
  return onSnapshot(collection(db, MEETINGS_COLLECTION), (snapshot) => {
    const meetings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(meetings);
  }, (error) => {
    console.error('Error in meetings subscription:', error);
  });
};

// ========== Property Selection Functions ==========

export const getPropertySelections = async () => {
  try {
    const snapshot = await getDocs(collection(db, PROPERTY_SELECTIONS_COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching property selections:', error);
    return [];
  }
};

export const savePropertySelections = async (propertySelections) => {
  try {
    const promises = propertySelections.map(selection =>
      setDoc(doc(db, PROPERTY_SELECTIONS_COLLECTION, selection.id), selection)
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Error saving property selections:', error);
  }
};

export const savePropertySelection = async (propertySelection) => {
  try {
    await setDoc(doc(db, PROPERTY_SELECTIONS_COLLECTION, propertySelection.id), propertySelection);
  } catch (error) {
    console.error('Error saving property selection:', error);
  }
};

export const deletePropertySelection = async (propertySelectionId) => {
  try {
    await deleteDoc(doc(db, PROPERTY_SELECTIONS_COLLECTION, propertySelectionId));
  } catch (error) {
    console.error('Error deleting property selection:', error);
  }
};

// Realtime subscription for property selections
export const subscribeToPropertySelections = (callback) => {
  return onSnapshot(collection(db, PROPERTY_SELECTIONS_COLLECTION), (snapshot) => {
    const propertySelections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(propertySelections);
  }, (error) => {
    console.error('Error in property selections subscription:', error);
  });
};

// ========== Property Functions ==========

export const getProperties = async () => {
  try {
    const snapshot = await getDocs(collection(db, PROPERTIES_COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
};

export const saveProperties = async (properties) => {
  try {
    const promises = properties.map(property =>
      setDoc(doc(db, PROPERTIES_COLLECTION, property.id), property)
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Error saving properties:', error);
  }
};

export const saveProperty = async (property) => {
  try {
    await setDoc(doc(db, PROPERTIES_COLLECTION, property.id), property);
  } catch (error) {
    console.error('Error saving property:', error);
  }
};

export const deleteProperty = async (propertyId) => {
  try {
    await deleteDoc(doc(db, PROPERTIES_COLLECTION, propertyId));
  } catch (error) {
    console.error('Error deleting property:', error);
  }
};

// Realtime subscription for properties
export const subscribeToProperties = (callback) => {
  return onSnapshot(collection(db, PROPERTIES_COLLECTION), (snapshot) => {
    const properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(properties);
  }, (error) => {
    console.error('Error in properties subscription:', error);
  });
};

// ========== Building Functions ==========

export const getBuildings = async () => {
  try {
    const snapshot = await getDocs(collection(db, BUILDINGS_COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching buildings:', error);
    return [];
  }
};

export const saveBuildings = async (buildings) => {
  try {
    // 먼저 기존 건물 데이터를 모두 삭제
    const snapshot = await getDocs(collection(db, BUILDINGS_COLLECTION));
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // 새로운 건물 데이터 저장
    const savePromises = buildings.map(building =>
      setDoc(doc(db, BUILDINGS_COLLECTION, building.id), building)
    );
    await Promise.all(savePromises);
  } catch (error) {
    console.error('Error saving buildings:', error);
    throw error;
  }
};

export const saveBuilding = async (building) => {
  try {
    await setDoc(doc(db, BUILDINGS_COLLECTION, building.id), building);
  } catch (error) {
    console.error('Error saving building:', error);
  }
};

export const deleteBuilding = async (buildingId) => {
  try {
    await deleteDoc(doc(db, BUILDINGS_COLLECTION, buildingId));
  } catch (error) {
    console.error('Error deleting building:', error);
  }
};

// Realtime subscription for buildings
export const subscribeToBuildings = (callback) => {
  return onSnapshot(collection(db, BUILDINGS_COLLECTION), (snapshot) => {
    const buildings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(buildings);
  }, (error) => {
    console.error('Error in buildings subscription:', error);
  });
};

// ========== Utility Functions ==========

/**
 * 중복된 건물 데이터 제거 (건물명 + 지번 기준)
 * @returns {Promise<{removed: number, kept: number}>} 제거된 건물 수와 유지된 건물 수
 */
export const removeDuplicateBuildings = async () => {
  try {
    const snapshot = await getDocs(collection(db, BUILDINGS_COLLECTION));
    const buildings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 건물명 + 지번을 키로 사용하여 중복 검사
    const uniqueMap = new Map();
    const duplicates = [];

    buildings.forEach(building => {
      const key = `${building.name}_${building.address}`.toLowerCase();

      if (uniqueMap.has(key)) {
        // 중복 발견: 더 오래된 것(먼저 추가된 것)을 삭제 대상으로
        const existing = uniqueMap.get(key);
        const existingTime = new Date(existing.createdAt || 0).getTime();
        const currentTime = new Date(building.createdAt || 0).getTime();

        if (currentTime > existingTime) {
          // 현재 건물이 더 최신이면 기존 건물 삭제
          duplicates.push(existing.id);
          uniqueMap.set(key, building);
        } else {
          // 기존 건물이 더 최신이면 현재 건물 삭제
          duplicates.push(building.id);
        }
      } else {
        uniqueMap.set(key, building);
      }
    });

    // 중복 건물 삭제
    const deletePromises = duplicates.map(id =>
      deleteDoc(doc(db, BUILDINGS_COLLECTION, id))
    );
    await Promise.all(deletePromises);

    return {
      removed: duplicates.length,
      kept: uniqueMap.size
    };
  } catch (error) {
    console.error('Error removing duplicate buildings:', error);
    throw error;
  }
};
