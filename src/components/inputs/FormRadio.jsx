import React, { useState } from 'react';

const FormRadio = ({ name, label, options = [], selectedValue = '', onChange, error, disabled, tabIndex }) => {
  const [isTouched, setIsTouched] = useState(false);

  const handleInputChange = (e) => {
    setIsTouched(true);
    if (onChange) onChange(e);
  };

  const shouldShowError = (isTouched || selectedValue) && error;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      
      <div className="flex flex-col gap-2 mt-1">
        {options.map((opt) => {
          const isChecked = selectedValue === opt.value;
          return (
            <label 
              key={opt.value} 
              className={`flex items-center gap-2 text-sm font-medium text-slate-700 select-none ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <input 
                type="radio" 
                name={name} 
                value={opt.value} 
                checked={isChecked} 
                onChange={handleInputChange} 
                onBlur={() => setIsTouched(true)}
                disabled={disabled}
                tabIndex={tabIndex}
                className={`h-4 w-4 rounded-full border appearance-none checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none ${
                  shouldShowError ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                } ${
                  disabled ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : ''
                }`}
                style={{
                  backgroundImage: isChecked 
                    ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='8' cy='8' r='3'/%3E%3C/svg%3E")` 
                    : 'none',
                  backgroundPosition: 'center',
                  backgroundSize: '100% 100%',
                }}
              />
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>

      {shouldShowError && (
        <p className="text-xs font-medium text-rose-500 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormRadio;