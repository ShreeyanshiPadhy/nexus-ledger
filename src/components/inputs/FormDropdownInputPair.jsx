import React from 'react';

const FormDropdownInputPair = ({ config, dropdownValue, calculatedValue, onChange, disabled, tabIndex }) => {
  const { dropdownField, calculatedField } = config;

  return (
    <div className="grid grid-cols-2 gap-4 items-center w-full mt-1">      
      
      <div className="relative w-full">
        <select
          data-field={config.id} 
          id={dropdownField.id}
          name={dropdownField.id} 
          value={dropdownValue || ''} 
          onChange={onChange} 
          disabled={disabled}
          tabIndex={tabIndex}
          className={`w-full px-3 py-2 text-sm border rounded-md font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 appearance-none pr-8 transition-colors ${
            disabled 
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-white border border-slate-300 text-slate-800'
          }`}
        >
          <option value="" disabled hidden>Select Option...</option>
          {dropdownField.options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className={`absolute inset-y-0 right-3 flex items-center pointer-events-none font-bold text-xs ${
          disabled ? 'text-slate-300' : 'text-slate-400'
        }`}>▼</div>
      </div>

      <div className="w-full">
        <input
          type="text"
          id={calculatedField.id}
          name={calculatedField.id}
          value={calculatedValue || ''}
          placeholder={calculatedField.placeholder || "Awaiting telemetry selection..."}
          disabled
          tabIndex={-1} 
          className="w-full bg-slate-50 border border-slate-200 text-slate-500 px-3 py-2 text-sm rounded-md font-medium select-none cursor-not-allowed shadow-inner"
        />
      </div>
    </div>
  );
};

export default FormDropdownInputPair;