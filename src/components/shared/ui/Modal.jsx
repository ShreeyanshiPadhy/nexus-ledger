import React from 'react';

const Modal = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  onConfirm, 
  onCancel,
  variant = "warning" 
}) => {
  if (!isOpen) return null;

  const borderClasses = {
    warning: "border-amber-500",
    danger: "border-rose-500",
    success: "border-emerald-500"
  };

  const confirmBtnClasses = {
    warning: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/20",
    danger: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/20",
    success: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/20"
  };

  return (
    <div className="ModalOverlay" style={{ zIndex: 10000 }} onClick={onCancel || (() => {})}>
      <div className={`ModalCardSmall border-l-4 ${borderClasses[variant] || "border-indigo-500"}`} onClick={(e) => e.stopPropagation()}>
        <div>
          {title && (
            <h3 className="text-base font-bold text-slate-900 tracking-wide">
              {title}
            </h3>
          )}
          <p className="text-sm text-slate-600 mt-2 leading-relaxed font-medium">
            {message}
          </p>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-all cursor-pointer select-none"
            >
              {cancelText}
            </button>
          )}
          
          <button 
            type="button" 
            onClick={onConfirm} 
            className={`px-4 py-2 text-sm font-semibold text-white rounded-md shadow-sm transition-all cursor-pointer select-none focus:outline-none focus:ring-2 ${confirmBtnClasses[variant] || "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;