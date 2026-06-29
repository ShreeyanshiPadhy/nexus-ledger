
import formConfig from '../config/formConfig.json';

const TabsConfig = formConfig.tabs;

export const buildTabGroupedPayload = (formData, databaseLookups) => {
  const groups = {};

  TabsConfig.forEach((tab) => {
    const tabName = tab.label;
    groups[tabName] = {};

    if (!tab.fields) return;

    tab.fields.forEach((field) => {
      if (field.type === 'dropdown-input-pair') {
        const dropId = field.dropdownField?.id;
        const rawSelectionValue = formData[dropId] || formData[field.id];
        
        let availableOptions = field.dropdownField?.options || [];
        if (field.dropdownField?.optionsFromReduxKey) {
          availableOptions = databaseLookups[field.dropdownField.optionsFromReduxKey] || [];
        }
        
        const matchedOption = availableOptions.find(opt => String(opt.value) === String(rawSelectionValue));
        const humanReadableLabel = matchedOption ? matchedOption.label : (rawSelectionValue || "—");
        
        if (rawSelectionValue !== undefined) {
          groups[tabName][field.id] = humanReadableLabel;
        }

        const calcId = field.calculatedField?.id;
        if (calcId && formData[calcId] !== undefined) {
          groups[tabName][calcId] = formData[calcId];
        }
      } else {
        const fieldId = field.name || field.id;
        if (formData[fieldId] !== undefined) {
          groups[tabName][fieldId] = formData[fieldId];
        }
        const unitFieldName = `${fieldId}_unit`;
        if (formData[unitFieldName] !== undefined) {
          groups[tabName][unitFieldName] = formData[unitFieldName];
        }
      }
    });
  });

  return groups;
};