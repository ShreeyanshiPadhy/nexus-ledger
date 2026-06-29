import React, { useState } from 'react';

const FormSelect = ({ id, label, options = [], value, onChange, onBlur, error, disabled, tabIndex }) => {
  const [isTouched, setIsTouched] = useState(false);

  const handleBlur = () => {
    setIsTouched(true);
    if (onBlur) onBlur(id);
  };

  const shouldShowError = isTouched && error;

  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          id={id}
          name={id}
          value={value || ""}
          onChange={onChange}
          onBlur={handleBlur}
          disabled={disabled}
          tabIndex={tabIndex}
          className={`w-full px-3 py-2 border rounded-md shadow-xs text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150 ${
            shouldShowError ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
          } ${
            disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'bg-white text-slate-900'
          } ${
            !value && !disabled ? 'text-slate-500 font-medium' : ''
          }`}
        >
]          {!options.some(opt => opt.value === "") && (
            <option value="" disabled>Select an option...</option>
          )}

          {options.map((opt, index) => (
            <option 
              key={index} 
              value={opt.value} 
              disabled={opt.value === ""} 
              className={opt.value === "" ? "text-slate-400" : "text-slate-900"}
            >
              {opt.label}
            </option>
          ))}
        </select>

        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 ${
          disabled ? 'text-slate-300' : 'text-slate-400'
        }`}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {shouldShowError && (
        <p className="text-xs font-medium text-rose-500 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormSelect;