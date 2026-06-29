import React from 'react';

const FormCheckbox = ({ id, label, checked, onChange, onBlur, error, disabled, tabIndex }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className={`flex items-center gap-2 text-sm font-medium text-slate-700 select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}>
        <input 
          id={id} 
          name={id} 
          type="checkbox" 
          checked={!!checked} 
          onChange={onChange} 
          onBlur={onBlur}
          disabled={disabled}
          tabIndex={tabIndex}
          className={`h-4 w-4 rounded transition-all border appearance-none checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none flex items-center justify-center ${
            error ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
          } ${
            disabled ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400' : ''
          }`} 
          style={{ 
            backgroundImage: checked 
              ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6.173 11.523L2.654 8.004l1.06-1.061 2.459 2.458L12.28 3.28l1.061 1.06-7.168 7.183z'/%3E%3C/svg%3E")` 
              : 'none', 
            backgroundPosition: 'center', 
            backgroundSize: '80% 80%', 
            backgroundRepeat: 'no-repeat' 
          }} 
        />
        {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      </label>
      {error && <p className="text-xs font-medium text-rose-500 mt-0.5">{error}</p>}
    </div>
  );
};

export default FormCheckbox;