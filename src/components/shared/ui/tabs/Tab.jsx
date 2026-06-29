import React from 'react';

const TabComp = (({ name, isActive, onSelect, status = 'PRISTINE' }) => {
  
  let dotColorClass = 'bg-slate-300'; 
  switch (status) {
    case 'ACTIVE':
      dotColorClass = 'bg-indigo-600 ring-4 ring-indigo-100'; 
      break;
    case 'VALID':
      dotColorClass = 'bg-emerald-500'; 
      break;
    case 'INVALID':
      dotColorClass = 'bg-amber-500'; 
      break;
    case 'PRISTINE':
    default:
      dotColorClass = 'bg-slate-300';
      break;
  }

  return (
    <button 
      type="button"
      className={`${isActive ? "active_tab" : "inactive_tab"} flex items-center gap-2`} 
      onClick={onSelect}
    >
      <span className={`w-2 h-2 rounded-full transition-all duration-200 shrink-0 ${dotColorClass}`} />
      
      <span>{name}</span>
    </button>
  );
});

const Tab = React.memo(TabComp);

export default Tab;