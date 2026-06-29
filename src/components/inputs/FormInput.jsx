import React from 'react';

const FormInput = ({ id, label, type, value, onChange, onBlur, error, endAction, disabled, tabIndex }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      
      <div className="relative w-full flex items-center">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          tabIndex={tabIndex}
          className={`w-full px-3 py-2 text-sm border rounded-md text-slate-800 font-medium transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
            error ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
          } ${endAction ? 'pr-10' : ''} ${
            disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''
          }`} 
        />
        
        {endAction && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
            {endAction}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-rose-500 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;