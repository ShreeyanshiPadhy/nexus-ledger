export const validateDynamicField = (value, fieldConfig) => {
  if (fieldConfig.type === 'checkbox') {
    if (fieldConfig.required && !value) {
      return fieldConfig.errors?.empty || "This field is required."; // Safe fallback
    }
    if (fieldConfig.mustMatch !== undefined && value !== fieldConfig.mustMatch) {
      return fieldConfig.errors?.invalid || "Invalid entry layout.";
    }
    return "";
  }

  const cleanValue = typeof value === 'string' ? value.trim() : value;

  if (fieldConfig.required && !cleanValue) {
    return fieldConfig.errors?.empty || "This field is required.";
  }

  if (!cleanValue) return ""; 

  if (fieldConfig.minLength && cleanValue.length < fieldConfig.minLength) {
    return fieldConfig.errors?.invalid || "Entry is too short.";
  }

  if (fieldConfig.regex) {
    const regex = new RegExp(fieldConfig.regex);
    if (!regex.test(cleanValue)) {
      return fieldConfig.errors?.invalid || "Invalid format.";
    }
  }

  if (fieldConfig.mustMatch !== undefined && cleanValue !== fieldConfig.mustMatch) {
    return fieldConfig.errors?.invalid || "Values do not match.";
  }

  return "";
};

export const calculateTabErrors = (fields = [], formData = {}, isSkipped = false) => {
  const fieldErrors = {};
  let isTabValid = true;

  if (isSkipped) {
    return { fieldErrors, isTabValid: true };
  }

  fields.forEach((field) => {
    const isRequired = field.required === true;

    if (field.type === 'dropdown-input-pair') {
      const dropdownId = field.dropdownField?.id;
      const dropdownVal = formData[dropdownId];
      const isDropdownBlank = dropdownVal === undefined || dropdownVal === null || String(dropdownVal).trim() === '';

      let errorMsg = "";
      if (isRequired) {
        errorMsg = isDropdownBlank ? (field.errors?.empty || "Selection is required.") : validateDynamicField(dropdownVal, field);
      } else if (!isDropdownBlank) {
        errorMsg = validateDynamicField(dropdownVal, field);
      }

      fieldErrors[field.id] = errorMsg;
      if (errorMsg) isTabValid = false;
    } 
    else {
      const value = formData[field.id];
      const isBlank = value === undefined || value === null || String(value).trim() === '' || (field.type === 'checkbox' && !value);

      let errorMsg = "";
      if (isRequired) {
        errorMsg = isBlank ? (field.errors?.empty || "Field is required.") : validateDynamicField(value, field);
      } else if (!isBlank) {
        errorMsg = validateDynamicField(value, field);
      }

      fieldErrors[field.id] = errorMsg;
      if (errorMsg) isTabValid = false;
    }
  });

  return { fieldErrors, isTabValid };
};