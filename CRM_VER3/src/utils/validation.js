export const validateCustomer = (customer) => {
  if (!customer.name || customer.name.trim() === '') {
    alert('고객명은 필수 입력 항목입니다.');
    return false;
  }
  if (customer.phone && !validatePhone(customer.phone)) {
    alert('연락처는 010-xxxx-xxxx 형식으로 입력하세요.');
    return false;
  }
  return true;
};

export const validatePhone = (phone) => {
  if (!phone) return true; // Phone is optional
  const phonePattern = /^010-\d{4}-\d{4}$/;
  return phonePattern.test(phone);
};
