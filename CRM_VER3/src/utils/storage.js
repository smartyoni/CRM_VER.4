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
