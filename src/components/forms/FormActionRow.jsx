import React from 'react';

export default function FormActionRow({ 
  currIdx, 
  hasNextStep, 
  isTabValid, 
  skipConditionLabel, 
  onPrevious, 
  onNext, 
  onResetClick 
}) {
  return (
    <div className="ActionRow border-t border-slate-100 bg-slate-50/30 grid grid-cols-3 items-center w-full">
      <div className="text-left">
        <button 
          type="button" 
          onClick={onPrevious} 
          className={currIdx > 0 ? "activeCustomPrev" : "inactiveCustomPrev"}
          disabled={currIdx === 0}
        >
          Previous
        </button>
      </div>

      <div className="text-right col-span-2">
        <button 
          type="button" 
          onClick={onResetClick} 
          className="px-4 py-2 mr-4 text-sm font-semibold text-rose-600 bg-white border border-rose-200 rounded-md hover:bg-rose-50 shadow-xs"
        >
          Reset Batch
        </button>
        
        <button 
          type="button" 
          onClick={onNext} 
          className={hasNextStep && isTabValid ? "activeCustomNext" : "inactiveCustomNext"}
          disabled={!hasNextStep || !isTabValid}
        >
          {skipConditionLabel ? "Skip" : "Next"}
        </button>
      </div>
    </div>
  );
}