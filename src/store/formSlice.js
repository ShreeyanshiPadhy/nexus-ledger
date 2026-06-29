import { createSlice } from '@reduxjs/toolkit';
import formConfig from '../config/formConfig.json';

const INITIAL_TAB_ID = formConfig.tabs[0].id;
const DEFAULT_UNITS = { temperature: 'C', pressure: 'bar', flow: 'kg_h' };

const getCleanInitialState = () => {
  const initialFormData = {};
  const initialTabStatus = {};

  formConfig.tabs.forEach((tab) => {
    initialTabStatus[tab.id] = 'PRISTINE';
    if (!tab.fields) return;

    tab.fields.forEach((field) => {
      initialFormData[field.id] = '';
      
      if (field.unitGroup) {
        initialFormData[`${field.id}_unit`] = DEFAULT_UNITS[field.unitGroup] || '';
      }

      if (field.type === 'dropdown-input-pair') {
        if (field.dropdownField?.id) initialFormData[field.dropdownField.id] = '';
        if (field.calculatedField?.id) initialFormData[field.calculatedField.id] = '';
      }
    });
  });

  return {
    activeBatchId: `BATCH-${Date.now().toString().slice(-6)}`, 
    activeTab: INITIAL_TAB_ID,
    formData: initialFormData,
    tabStatus: initialTabStatus,
    visitedTabs: { [INITIAL_TAB_ID]: true }
  };
};

export const formSlice = createSlice({
  name: 'formInfo',
  initialState: getCleanInitialState(),
  reducers: {
    initializeTabFields: (state, action) => {
      const { tabId } = action.payload;
      if (!state.tabStatus[tabId] || state.tabStatus[tabId] === 'SKIPPED') {
        state.tabStatus[tabId] = 'PRISTINE';
      }
    },
    updateFormField: (state, action) => {
      const { id, value } = action.payload;
      state.formData[id] = value;
    },

    loadExistingRecord: (state, action) => {
      const { rawFormData, batchId, activeTab, tabStatus, visitedTabs } = action.payload || {};
      state.formData = rawFormData;
      state.activeBatchId = batchId; 

      if (activeTab) state.activeTab = activeTab;
      if (tabStatus) state.tabStatus = tabStatus;
      if (visitedTabs) state.visitedTabs = visitedTabs;
    },
    setTabStatus: (state, action) => {
      const { tabId, status } = action.payload;
      state.tabStatus[tabId] = status;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    resetForm: () => {
      return getCleanInitialState();
    },
    markTabAsVisited: (state, action) => {
      const { tabId } = action.payload;
      state.visitedTabs[tabId] = true;
    },
    registerSkippedTab: (state, action) => {
      const { tabId } = action.payload;
      state.tabStatus[tabId] = 'SKIPPED';
      state.visitedTabs[tabId] = true;
    },
    invalidateDownstreamTabs: (state, action) => {
      const { currentTabIdx } = action.payload;
      
      for (let i = currentTabIdx + 1; i < formConfig.tabs.length; i++) {
        const targetTab = formConfig.tabs[i];
        
        if (state.tabStatus?.[targetTab.id]) {
          state.tabStatus[targetTab.id] = 'PRISTINE';
        }

        if (!targetTab.fields) continue;

        targetTab.fields.forEach(field => {
          state.formData[field.id] = field.type === 'checkbox' ? false : "";
          
          if (field.type === 'dropdown-input-pair') {
            if (field.dropdownField?.id) state.formData[field.dropdownField.id] = ""; 
            if (field.calculatedField?.id) state.formData[field.calculatedField.id] = "";
          } 
          else if (field.unitGroup) {
            state.formData[`${field.id}_unit`] = DEFAULT_UNITS[field.unitGroup] || '';
          }
        });
      }
    }
  }
});

export const { updateFormField, loadExistingRecord, setTabStatus, resetForm, setActiveTab, markTabAsVisited, initializeTabFields, invalidateDownstreamTabs, registerSkippedTab } = formSlice.actions;
export default formSlice.reducer;