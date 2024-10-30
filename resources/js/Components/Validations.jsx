// validations.jsx

const isValidEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const isValidPhone = (phone) => {
  const re = /^\+1 \(\d{3}\) \d{3}-\d{4}$/;
  return re.test(phone);
};


export const validate = {
  formData: (data) => {
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
  },

  addHumanData: (data) => {
    const errors = {};

    if (!data.firstName || data.firstName.trim() === '') {
      errors.firstName = 'First name is required';
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
  },

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

  wipeout: (data) => {
    const errors = {};
    if (!data || data.wipeout === null || data.wipeout === undefined) {
      errors.wipeout = 'Wipeout selection is required';
    }

    return errors;
  },

  trusting: (data) => {
    const errors = {};

    return errors;
  },

  guardians: (data) => {
    const errors = {};
    if (!data || data.length === 0) {
      errors.guardians = 'At least one guardian for minors is required';
    }

    return errors;
  },

  pets: (data) => {
    const errors = {};
    if (!data || data.length === 0) {
      errors.pets = 'At least one guardian for pets is required';
    }

    return errors;
  },

  additional: (data) => {
    const errors = {};
    if (!data || Object.keys(data).length === 1) {
      errors.additional = 'Standard or Custom clause is required';
    }

    return errors;
  },


  poa: (data) => {
    const errors = {};

    // Validate poaProperty

    {/*
    if (!data.poaProperty || typeof data.poaProperty !== 'object') {
      errors.poaProperty = 'poaProperty is required';
    } else {
      if (data.poaProperty.attorney === null) {
        errors.poaProperty = errors.poaProperty || {};
        errors.poaProperty.attorney = 'Attorney is required in poaProperty';
      }
      if (data.poaProperty.attorney !== null && data.poaProperty.attorney === data.poaProperty.join) {
        errors.poaProperty = errors.poaProperty || {};
        errors.poaProperty.join = 'Attorney and Joint can´t be the same person';
      }
    }

    // Validate poaHealth
    if (!data.poaHealth || typeof data.poaHealth !== 'object') {
      errors.poaHealth = 'poaHealth is required';
    } else {
      if (data.poaHealth.attorney === null) {
        errors.poaHealth = errors.poaHealth || {};
        errors.poaHealth.attorney = 'Attorney is required in poaHealth';
      }
      if (data.poaHealth.attorney !== null && data.poaHealth.attorney === data.poaHealth.join) {
        errors.poaHealth = errors.poaHealth || {};
        errors.poaHealth.join = 'Attorney and Joint can´t be the same person';
      }
    }
    return errors;
  },
  documentDOM: (data) => {
    const errors = {};
    if (!data || !data.Will) {
      errors.documentDOM = 'Please Save your Document to proceed';
    }
 */ }
    return errors;
  },
}