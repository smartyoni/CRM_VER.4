// 드롭다운 옵션
export const SOURCES = ['네이버광고', '블로그', '워킹', '지인소개', '기존고객', '기타'];
export const PROPERTY_TYPES = ['매매', '임대'];
export const PROPERTY_CATEGORIES = ['오피스텔', '오피스', '상가', '지산', '아파트'];
export const STATUSES = ['신규', '진행중', '장기관리고객', '보류'];
export const PROGRESS_STATUSES = ['매물제안예정', '매물제안중', '미팅예정', '접수후대기중'];
export const ACTIVITY_TYPES = ['전화상담', '문자/카톡', '매물제안', '워킹상담', '현장안내', '미팅진행', '기타'];
export const PROPERTY_STATUSES = ['확인전', '확인중', '볼수있음', '오늘못봄', '계약됨'];

// 건물정보 관련 상수
export const BUILDING_LOCATIONS = ['향교', '나루', '발산', '마곡', '신방화', '가양', '등촌', '공항', '화곡', '기타'];
export const BUILDING_TYPES = ['오피스텔', '상업용', '아파트', '지산', '기타'];

// 계약호실 관련 상수
export const CONTRACT_PROGRESS_STATUSES = ['계약서작성', '잔금', '입주완료', '퇴실함', '계약이력없음'];

export const CONTRACT_PROPERTY_MANAGEMENT = [
  '양타',
  '공동(기간지남-매물작업하기)',
  '공동(신규-1회기다리기)',
  '이탈(관리소홀)',
  '퇴실함(타부동산계약-매물작업하기)',
  '매매됨',
  '매매됨-매수인실거주중',
  '매매됨-매수인정보모름',
  '매물만접수(타부동산계약-매물작업하기)'
];

export const CONTRACT_EXPIRY_MANAGEMENT = [
  '1.문의중',
  '10.신규고객',
  '11.연장고객',
  '12.공동계약고객',
  '13.임대인입주함(직계,지인등)',
  '14.퇴실함(타부동산에서 계약)',
  '15.계약이력없음',
  '16.기타',
  '3.임대인고지(퇴실희망/매물장올리기)',
  '4.조건협의중',
  '6.일정협의중',
  '7.계약서작성일확정',
  '9.퇴실확정(임차인맞추는중)'
];
