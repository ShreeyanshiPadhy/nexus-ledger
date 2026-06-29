import React from 'react';

const FormUnitInput = ({ id, label, value, unitValue, unitOptions = [], placeholder, onChange, onBlur, error, disabled, tabIndex }) => {
  const unitFieldName = `${id}_unit`;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label htmlFor={id} className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>}
      
      <div 
        data-field={id}
        className="relative w-full flex items-stretch -m-0.5 p-0.5 rounded-md transition-all duration-500"
      >
        <input
          id={id}
          name={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          tabIndex={tabIndex}
          className={`w-full pl-3 pr-20 py-2 text-sm border rounded-l-md text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
            error ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
          } ${
            disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'bg-white'
          }`}
        />
        <div className={`relative flex items-center border-y border-r rounded-r-md px-2 border-l-0 transition-colors ${
          disabled ? 'bg-slate-100 border-slate-200' : 'bg-slate-50 border-slate-300'
        }`}>
          <select
            id={unitFieldName}
            name={unitFieldName}
            value={unitValue}
            onChange={onChange}
            disabled={disabled}
            tabIndex={tabIndex}
            className={`bg-transparent text-xs font-semibold focus:outline-none pr-4 appearance-none h-full transition-colors ${
              disabled ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 cursor-pointer'
            }`}
          >
            {unitOptions?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className={`absolute right-2 pointer-events-none font-bold text-[9px] ${
            disabled ? 'text-slate-300' : 'text-slate-400'
          }`}>▼</div>
        </div>
      </div>
      {error && <p className="text-xs font-medium text-rose-500 mt-0.5">{error}</p>}
    </div>
  );
};

export default FormUnitInput;