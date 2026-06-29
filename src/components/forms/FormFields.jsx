import React from 'react';
import FormInput from '../inputs/FormInput';
import FormSelect from '../inputs/FormSelect';
import FormRadio from '../inputs/FormRadio';
import FormCheckbox from '../inputs/FormCheckbox';
import FormTextArea from '../inputs/FormTextArea';
import FormUnitInput from '../inputs/FormUnitInput';
import FormDropdownInputPair from '../inputs/FormDropdownInputPair';

const UNIT_OPTIONS = {
  temperature: [{ label: '°C', value: 'C' }, { label: '°F', value: 'F' }, { label: 'K', value: 'K' }],
  pressure: [{ label: 'bar', value: 'bar' }, { label: 'psi', value: 'psi' }, { label: 'MPa', value: 'mpa' }],
  flow: [{ label: 'kg/h', value: 'kg_h' }, { label: 'lb/h', value: 'lb_h' }]
};

const GRID_SPANS = {
  'half': 'col-span-1 md:col-span-3 w-full',
  'third': 'col-span-1 md:col-span-2 w-full',
  'two-thirds': 'col-span-1 md:col-span-4 w-full'
};

export default function FormFields({ fields, formData, fieldErrors, touchedFields, telemetryMetrics, handleChange, handleBlur, disabled }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-x-10 gap-y-8 items-start w-full bg-slate-50/20 p-4 rounded-lg">
      {fields.map(field => {
        const val = formData[field.id] !== undefined ? formData[field.id] : '';
        
        const isPair = field.type === 'dropdown-input-pair';
        const isTouched = isPair ? (touchedFields[field.id] || touchedFields[field.dropdownField?.id]) : touchedFields[field.id];
        const err = isTouched ? fieldErrors[field.id] : "";

        const dynamicLabel = (
          <span>{field.label} {field.required && <span className="text-red-500 font-bold ml-0.5">*</span>}</span>
        );
        
        const gridColumnClass = GRID_SPANS[field.gridSpan] || 'col-span-1 md:col-span-6 w-full';

        const commonProps = {
          id: field.id,
          label: dynamicLabel,
          disabled: disabled,
          tabIndex: disabled ? -1 : 0,
          error: err
        };

        return (
          <div key={field.id} className={gridColumnClass}>
            
            {field.type === 'text' && !field.unitGroup && (
               <FormInput {...commonProps} value={val} placeholder={field.placeholder} onChange={handleChange} onBlur={() => handleBlur(field.id)} />
            )}

            {field.type === 'text' && field.unitGroup && (
               <FormUnitInput {...commonProps} value={val} unitValue={formData[`${field.id}_unit`]} unitOptions={UNIT_OPTIONS[field.unitGroup]} placeholder={field.placeholder} onChange={handleChange} onBlur={() => handleBlur(field.id)} />
            )}

            {field.type === 'select' && (
              <FormSelect {...commonProps} value={val} options={field.options} onChange={handleChange} onBlur={() => handleBlur(field.id)} />
            )}

            {field.type === 'radio' && (
              <FormRadio name={field.id} label={dynamicLabel} selectedValue={val} options={field.options} onChange={handleChange} error={err} disabled={disabled} tabIndex={commonProps.tabIndex} />
            )}

            {field.type === 'checkbox' && (
              <FormCheckbox {...commonProps} checked={val} onChange={handleChange} onBlur={() => handleBlur(field.id)} />
            )}

            {field.type === 'textarea' && (
              <FormTextArea {...commonProps} value={val} placeholder={field.placeholder} onChange={handleChange} />
            )}

            {field.type === 'dropdown-input-pair' && (
              <div className={`flex flex-col gap-1 w-full ${disabled ? 'pointer-events-none' : ''}`}>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{dynamicLabel}</label>
                <FormDropdownInputPair 
                  config={field}
                  dropdownValue={formData[field.dropdownField?.id] || ''}
                  calculatedValue={telemetryMetrics[field.calculatedField?.metricKey]}
                  onChange={handleChange}
                  disabled={disabled}
                  tabIndex={commonProps.tabIndex}
                />
                {err && <p className="text-xs font-medium text-rose-500 mt-0.5">{err}</p>}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}