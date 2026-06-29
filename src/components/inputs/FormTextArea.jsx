import React, { useState } from 'react';

const FormTextArea = ({ id, label, value = '', onChange, error, placeholder = '',rows = 3,disabled, tabIndex }) => {
  const [isTouched, setIsTouched] = useState(false);
  const isDirty = isTouched || (typeof value === 'string' && value.trim().length > 0);

  const displayError = error === true || (error && error.includes('empty'))
    ? `${label} cannot be empty`
    : error;

  const shouldShowError = isDirty && displayError;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      
      <textarea 
        id={id} 
        name={id}
        value={value} 
        onChange={(e) => { setIsTouched(true); if (onChange) onChange(e); }} 
        onBlur={() => setIsTouched(true)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        tabIndex={tabIndex}
        className={`w-full px-3 py-2 text-sm border rounded-md font-medium transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-y ${
          shouldShowError 
            ? 'border-rose-300 bg-rose-50/20 focus:ring-rose-500 focus:border-rose-500' 
            : 'border-slate-300'
        } ${
          disabled 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' 
            : 'text-slate-800'
        }`}
      ></textarea>

      {shouldShowError && (
        <p className="text-xs font-medium text-rose-500 mt-0.5">
          {displayError}
        </p>
      )}
    </div>
  );
};

export default FormTextArea;