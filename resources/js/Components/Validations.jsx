// validations.jsx

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


export const validateAddHumanData = (data) => {
  const errors = {};

  if (!data.firstName || data.firstName.trim() === '') {
    errors.firstName = 'First name is required';
  }

  if (!data.middleName || data.middleName.trim() === '') {
    errors.middleName = 'Middle name is required';
  }

  if (!data.lastName || data.lastName.trim() === '') {
    errors.lastName = 'Last name is required';
  }

  if (!data.relative || data.relative.trim() === '') {
    errors.relative = 'Relative is required';
  }

  if (!data.relative === '' || data.relative.trim() === '') {
    errors.otherRelative = 'Please specify the relation';
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Valid email is required';
  }

  if (!data.phone || !isValidPhone(data.phone)) {
    errors.phone = 'Valid phone number is required (format: +1 (XXX) XXX-XXXX)';
  }

  if (!data.city || data.city.trim() === '') {
    errors.city = 'City is required';
  }

  if (!data.province || data.province.trim() === '') {
    errors.province = 'Province is required';
  }

  if (!data.country || data.country.trim() === '') {
    errors.country = 'Country is required';
  }

  return errors;
};

export const validate = {

  kids: (data) => {
    const errors = {};

    if (!data || data.length === 0) {
      errors.kids = 'At least one kid is required';
    }

    return errors;
  },

  executors: (data) => {
    const errors = {};

    if (!data || data.length === 0) {
      errors.executors = 'At least one executor is required';
    }
    return errors;
  },

  bequest: (data) => {
    const errors = {};

    if (!data || data.length === 0) {
      errors.bequest = 'At least one bequest is required';
    }
    return errors;
  },


  residue: (data) => {
    const errors = {};
    console.log(data)
    if (!data || data.selected === null || data.selected === undefined) {
      errors.residue = 'Residue selection is required';
    }

    if (data.selected === "Custom Clause" && data.clause === "") {
      errors.residue = 'Custom clause is required';
    }



    if (data.selected === "Specific Beneficiaries" && data.beneficiary.length === 0) {
      errors.residue = 'Specific beneficiary is required';
    }



    return errors;
  },
}