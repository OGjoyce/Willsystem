// validations.js

const isValidEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const isValidPhone = (phone) => {
  const re = /^\+1 \(\d{3}\) \d{3}-\d{4}$/;
  return re.test(phone);
};

export const validateFormData = (data) => {
  const errors = {};

  if (!data.fullName || data.fullName.trim() === '') {
    errors.fullName = 'Full name is required';
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Valid email is required';
  }

  if (!data.telephone || !isValidPhone(data.telephone)) {
    errors.telephone = 'Valid phone number is required (format: +1 (XXX) XXX-XXXX)';
  }

  if (!data.city || data.city.trim() === '') {
    errors.city = 'City is required';
  }

  if (!data.province || data.province.trim() === '') {
    errors.province = 'Province is required';
  }

  return errors;
};