import React from 'react';

const SubmitTooltip = ({ show, invalidTabs }) => {
  if (!show || invalidTabs.length === 0) return null;

  return (
    <div className="absolute bottom-full right-0 z-50 mb-3 w-72 rounded-lg border border-red-200 bg-white p-3 shadow-sm ring-1 ring-black/5 animate-fadeIn">
      <div className="absolute top-full right-5 h-2 w-2 -translate-y-1 rotate-45 border-b border-r border-red-200 bg-white" />
      <p className="text-left text-xs leading-relaxed text-gray-600">
        Cannot submit. You have missing or invalid data records remaining inside:{' '}
        <span className="font-semibold text-red-600">
          {invalidTabs.join(', ')}
        </span>.
      </p>
    </div>
  );
};

export default SubmitTooltip;