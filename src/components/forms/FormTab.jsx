import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateFormField, setTabStatus, invalidateDownstreamTabs } from '../../store/formSlice';
import { calculateTabErrors } from '../../utils/formValidation';
import { useProcessTelemetry } from '../../hooks/useProcessTelemetry';
import formConfig from '../../config/formConfig.json';

import FormFields from './FormFields';
import LiveMetrics from './LiveMetrics.jsx'; 
import Modal from '../../components/shared/ui/Modal';

export default function FormTab({ tabConfig }) {
  const dispatch = useDispatch();
  
  const formData = useSelector((state) => state.formInfo.formData);
  const currentStatus = useSelector((state) => state.formInfo.tabStatus?.[tabConfig.id]);
  const databaseLookups = useSelector((state) => state.optionsLookup);
  
  const [touchedFields, setTouchedFields] = useState({});
  const [guardState, setGuardState] = useState({
    isOpen: false,
    targetKey: '',
    targetValue: '',
    message: ''
  });

  useEffect(() => {
    setTouchedFields({});
  }, [tabConfig.id]);

  const isTabSkippedByCondition = useMemo(() => {
    if (!tabConfig.skipCondition) return false;
    return formData[tabConfig.skipCondition.field] === tabConfig.skipCondition.value;
  }, [formData, tabConfig.skipCondition]);

  const telemetryMetrics = useProcessTelemetry(formData, tabConfig);

  useEffect(() => {
    if (!telemetryMetrics || !tabConfig.fields) return;

    tabConfig.fields.forEach((field) => {
      if (field.type === 'dropdown-input-pair' && field.calculatedField) {
        const calcId = field.calculatedField.id;
        const computedValue = telemetryMetrics[field.calculatedField.metricKey];

        if (computedValue !== undefined && formData[calcId] !== computedValue) {
          dispatch(updateFormField({ id: calcId, value: computedValue }));
        }
      }
    });
  }, [telemetryMetrics, tabConfig.fields, formData, dispatch]);

  const fieldsMap = useMemo(() => {
    const map = new Map();
    tabConfig.fields?.forEach(f => {
      if (!f) return;
      map.set(f.id, f);
      if (f.type === 'dropdown-input-pair') {
        if (f.dropdownField?.id) map.set(f.dropdownField.id, f.dropdownField);
        if (f.calculatedField?.id) map.set(f.calculatedField.id, f.calculatedField);
      }
    });
    return map;
  }, [tabConfig.fields]);

  const downstreamFieldsDefaults = useMemo(() => {
    const currentTabIdx = formConfig.tabs.findIndex(t => t.id === tabConfig.id);
    if (currentTabIdx === -1) return [];

    const fields = [];
    for (let i = currentTabIdx + 1; i < formConfig.tabs.length; i++) {
      formConfig.tabs[i].fields?.forEach(f => {
        if (!f) return;
        fields.push({ id: f.id, defaultValue: f.defaultValue, type: f.type });
        
        if (f.type === 'dropdown-input-pair') {
          if (f.dropdownField?.id) fields.push({ id: f.dropdownField.id, defaultValue: f.dropdownField.defaultValue, type: 'select' });
          if (f.inputField?.id) fields.push({ id: f.inputField.id, defaultValue: f.inputField.defaultValue, type: 'input' });
          if (f.calculatedField?.id) fields.push({ id: f.calculatedField.id, defaultValue: f.calculatedField.defaultValue, type: 'calculated' });
        }
      });
    }
    return fields;
  }, [tabConfig.id]);

  const { fieldErrors, isTabValid } = useMemo(() => {
    return calculateTabErrors(tabConfig.fields, formData, isTabSkippedByCondition);
  }, [tabConfig.fields, formData, isTabSkippedByCondition]);

  const processedFields = useMemo(() => {
    if (!tabConfig?.fields) return [];
    
    return tabConfig.fields.map(field => {
      if (field.optionsFromReduxKey) {
        return {
          ...field,
          options: [{ label: "Select Option...", value: "" }, ...(databaseLookups[field.optionsFromReduxKey] || [])]
        };
      }
      if (field.type === 'dropdown-input-pair' && field.dropdownField?.optionsFromReduxKey) {
        return {
          ...field,
          dropdownField: {
            ...field.dropdownField,
            options: [{ label: "Select Routing Protocol...", value: "" }, ...(databaseLookups[field.dropdownField.optionsFromReduxKey] || [])]
          }
        };
      }
      return field;
    });
  }, [tabConfig.fields, databaseLookups]);

  useEffect(() => {
    const nextStatus = isTabSkippedByCondition ? 'SKIPPED' : (isTabValid ? 'VALID' : 'INVALID');
    if (currentStatus !== nextStatus) {
      dispatch(setTabStatus({ tabId: tabConfig.id, status: nextStatus }));
    }
  }, [isTabValid, isTabSkippedByCondition, tabConfig.id, currentStatus, dispatch]); 

  const handleChange = useCallback((e) => {
    const { name, value, id, type, checked } = e.target;
    const targetKey = id || name;
    const targetValue = type === 'checkbox' ? checked : value;
    
    const fieldConfig = fieldsMap.get(targetKey);
    const existingValue = formData[targetKey];

    const hasDownstreamData = downstreamFieldsDefaults.some(({ id: dfId, defaultValue, type: dfType }) => {
      const currentVal = formData[dfId];
      if (currentVal === undefined || currentVal === null) return false;
      if (dfType === 'checkbox') return Boolean(currentVal) !== Boolean(defaultValue) && currentVal === true; 

      return String(currentVal).trim() !== String(defaultValue ?? '').trim() && String(currentVal).trim() !== '';
    });

    if (fieldConfig?.destructiveTriggers?.warnOnValueChange && existingValue && existingValue !== targetValue && hasDownstreamData) {
      setGuardState({
        isOpen: true,
        targetKey,
        targetValue,
        message: fieldConfig.destructiveTriggers.warningMessage
      });
    } else {
      dispatch(updateFormField({ id: targetKey, value: targetValue }));
    }

    setTouchedFields(prev => ({ ...prev, [targetKey]: true }));
  }, [formData, fieldsMap, downstreamFieldsDefaults, dispatch]);

  const handleBlur = useCallback((fieldId) => {
    setTouchedFields(prev => ({ ...prev, [fieldId]: true }));
  }, []);

  const handleExecuteDestructiveReset = useCallback(() => {
    const { targetKey, targetValue } = guardState;
    dispatch(updateFormField({ id: targetKey, value: targetValue }));
    
    const activeTabIdx = formConfig.tabs.findIndex(t => t.id === tabConfig.id);
    if (activeTabIdx !== -1) {
      dispatch(invalidateDownstreamTabs({ currentTabIdx: activeTabIdx }));
    }
    setGuardState({ isOpen: false, targetKey: '', targetValue: '', message: '' });
  }, [guardState, tabConfig.id, dispatch]);

  return (
    <div className="relative w-full flex-1 flex flex-col min-h-[300px]">
      <div 
        className={`w-full flex-1 flex flex-col justify-between transition-all duration-300 ${
          isTabSkippedByCondition ? 'opacity-20 pointer-events-none grayscale blur-[1px]' : ''
        }`}
        aria-hidden={isTabSkippedByCondition}
      >
        <FormFields 
          fields={processedFields}
          formData={formData}
          fieldErrors={fieldErrors}
          touchedFields={touchedFields}
          telemetryMetrics={telemetryMetrics}
          handleChange={handleChange}
          handleBlur={handleBlur}
          disabled={isTabSkippedByCondition}
        />

        <LiveMetrics config={tabConfig} formData={formData} />

        <Modal 
          isOpen={guardState.isOpen}
          title="State Reset Warning"
          message={guardState.message}
          confirmText="Confirm & Clear"
          cancelText="Cancel Change"
          variant="warning"
          onConfirm={handleExecuteDestructiveReset}
          onCancel={() => setGuardState({ isOpen: false, targetKey: '', targetValue: '', message: '' })}
        />
      </div>

      {isTabSkippedByCondition && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-8 max-w-lg text-center flex flex-col items-center pointer-events-auto animate-modalEnter">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center text-xl font-bold font-serif mb-4 select-none">i</div>
            <h3 className="text-base font-bold text-slate-900 mb-3 uppercase tracking-wide">Section Not Required</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Kinetics parameters are not required when configuring a <span className="font-bold text-indigo-600">"{tabConfig.skipCondition?.value}"</span> matrix environment layer. You can safely skip this configuration section.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}