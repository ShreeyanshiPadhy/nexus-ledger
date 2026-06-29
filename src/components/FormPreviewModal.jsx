import React, { useMemo } from 'react';
import formConfig from '../config/formConfig.json';

const FormPreviewModal = ({ 
  isOpen, 
  onClose, 
  formData = {}, 
  databaseLookups = {}, 
  onConfirm, 
  onChangeTab 
}) => {

  const sections = useMemo(() => {
    if (!isOpen) return [];
    
    return formConfig.tabs.map((tab) => {
      const gridFields = [];
      const textareas = [];

      tab.fields.forEach((field) => {
        if (field.type === 'dropdown-input-pair') {
          const rawSelectionValue = formData[field.dropdownField?.id] || formData[field.id]; 
          
          let availableOptions = field.dropdownField?.options || [];
          if (field.dropdownField?.optionsFromReduxKey) {
            availableOptions = databaseLookups[field.dropdownField.optionsFromReduxKey] || [];
          }

          const matchedOption = availableOptions.find(opt => String(opt.value) === String(rawSelectionValue));
          const dropDisplay = matchedOption ? matchedOption.label : (rawSelectionValue || '—');

          gridFields.push({
            key: `${field.id}_drop`,
            label: `${field.label} (Selected Profile)`,
            displayValue: dropDisplay
          });

          gridFields.push({
            key: `${field.id}_calc`,
            label: `${field.label} (Telemetry Output)`,
            displayValue: formData[field.calculatedField?.id] || '—'
          });
        } 
        else if (field.type === 'textarea') {
          textareas.push({
            key: field.id,
            label: field.label,
            rawValue: formData[field.id]
          });
        } 
        else {
          let displayVal = formData[field.id];
          
          if (field.type === 'password') {
            displayVal = '••••••••';
          } else if (field.type === 'checkbox') {
            displayVal = formData[field.id] ? 'Authorized / True' : 'No / Disabled';
          }

          const unitValue = formData[`${field.id}_unit`];
          if (unitValue && displayVal) {
            displayVal = `${displayVal} ${unitValue}`;
          }

          gridFields.push({
            key: field.id,
            label: field.label,
            displayValue: displayVal || '—'
          });
        }
      });

      return { 
        title: tab.label, 
        tabId: tab.id, 
        gridFields, 
        textareas 
      };
    });
  }, [isOpen, formData, databaseLookups]);

  if (!isOpen) return null;

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal-window" onClick={(e) => e.stopPropagation()}>
        
        <div className="preview-modal-header">
          <div>
            <h3 className="preview-modal-title">Review Form Logs</h3>
            <p className="preview-modal-subtitle">Double-check parameters across all configurations before final submission logging.</p>
          </div>
          <button type="button" onClick={onClose} className="preview-modal-close-btn">✕</button>
        </div>

        <div className="preview-modal-body">
          {sections.map((section) => (
            <div key={section.title} className="preview-section-card">
              
              <div className="preview-section-header">
                <h4 className="preview-section-title">{section.title}</h4>
                <button 
                  type="button"
                  onClick={() => { onChangeTab(section.tabId); onClose(); }} 
                  className="preview-edit-btn"
                >
                  Edit Section
                </button>
              </div>

              {section.gridFields.length > 0 && (
                <div className="preview-grid-matrix">
                  {section.gridFields.map((field) => (
                    <div key={field.key} className="preview-grid-row">
                      <span className="preview-row-label">{field.label}:</span>
                      <span className="preview-row-value">{field.displayValue}</span>
                    </div>
                  ))}
                </div>
              )}

              {section.textareas.map((field) => (
                <div key={field.key} className="preview-textarea-block">
                  <span className="preview-textarea-label">{field.label}:</span>
                  <p className="preview-textarea-box">
                    {field.rawValue?.trim() ? field.rawValue : `No specific ${field.label.toLowerCase()} entries logged.`}
                  </p>
                </div>
              ))}

            </div>
          ))}
        </div>

        <div className="preview-modal-footer">
          <button type="button" onClick={onClose} className="preview-back-btn">Go Back</button>
          <button type="button" onClick={onConfirm} className="preview-submit-btn">Confirm & Submit Log</button>
        </div>

      </div>
    </div>
  );
};

export default FormPreviewModal;