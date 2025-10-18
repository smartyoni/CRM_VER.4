import { saveCustomers, saveActivities, saveMeetings } from './storage';

// localStorage에서 Firestore로 데이터 마이그레이션
export const migrateLocalStorageToFirestore = async () => {
  try {
    // localStorage에서 데이터 가져오기
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const meetings = JSON.parse(localStorage.getItem('meetings') || '[]');

    console.log('마이그레이션 시작...');
    console.log(`고객: ${customers.length}개, 활동: ${activities.length}개, 미팅: ${meetings.length}개`);

    // Firestore에 저장
    if (customers.length > 0) {
      await saveCustomers(customers);
      console.log('✅ 고객 데이터 마이그레이션 완료');
    }

    if (activities.length > 0) {
      await saveActivities(activities);
      console.log('✅ 활동 데이터 마이그레이션 완료');
    }

    if (meetings.length > 0) {
      await saveMeetings(meetings);
      console.log('✅ 미팅 데이터 마이그레이션 완료');
    }

    console.log('🎉 모든 데이터 마이그레이션 완료!');

    // 선택사항: localStorage 백업 후 삭제
    // localStorage.removeItem('customers');
    // localStorage.removeItem('activities');
    // localStorage.removeItem('meetings');

    return { success: true, customers, activities, meetings };
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    return { success: false, error };
  }
};

// 브라우저 콘솔에서 직접 실행 가능하도록 전역에 노출 (개발용)
if (typeof window !== 'undefined') {
  window.migrateToFirestore = migrateLocalStorageToFirestore;
}
