import React, { useState, useMemo, startTransition, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { resetForm, setActiveTab, markTabAsVisited, initializeTabFields } from '../store/formSlice.js';
import { persistor } from '../store/store.js';
import { saveOrUpdateLog } from '../store/explorerSlice';

import formConfig from '../config/formConfig.json';
import FormTab from './forms/FormTab.jsx'; 
import TabScroller from './shared/ui/tabs/TabScroller.jsx';
import SubmitTooltip from './SubmitTooltip.jsx';
import FormPreviewModal from './FormPreviewModal.jsx';
import Modal from './shared/ui/Modal';

import FormSearch from './forms/FormSearch.jsx';
import FormActionRow from './forms/FormActionRow.jsx';
import { buildTabGroupedPayload } from '../utils/formPayloadTransformer.js';

const TabsConfig = formConfig.tabs;
const INITIAL_TAB_ID = formConfig.tabs[0].id;

function MultiTabForm({BackToDash}) {
  const dispatch = useDispatch();
  const [showDraftSuccess, setShowDraftSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const sessionBatchId = useSelector((state) => state.formInfo.activeBatchId);
  const reduxActiveTabId = useSelector((state) => state.formInfo.activeTab);
  const visitedTabs = useSelector((state) => state.formInfo.visitedTabs || {});
  const tabStatus = useSelector((state) => state.formInfo.tabStatus || {});
  const finalMasterData = useSelector((state) => state.formInfo.formData);
  const databaseLookups = useSelector((state) => state.optionsLookup || {});
  const allLogs = useSelector((state) => state.explorerData?.allLogs || []);
  const [showEmptyDraftWarning, setShowEmptyDraftWarning] = useState(false);
  
  const isFormCompletelyEmpty = useMemo(() => {
    return Object.entries(finalMasterData).every(([key, value]) => {
      if (key.endsWith('_unit')) return true; 
      
      return value === '' || value === false || value === null || value === undefined;
    });
  }, [finalMasterData]);

  const originalStatus = useMemo(() => {
    const matchingLog = allLogs.find(item => item.payload?.batchId === sessionBatchId);
    return matchingLog?.payload?.status || "DRAFT";
  }, [allLogs, sessionBatchId]);

  const isExistingSubmission = originalStatus === 'COMPLETED' || originalStatus === 'REVISED' || originalStatus === 'PENDING REVISION';

  const activeTabId = reduxActiveTabId || INITIAL_TAB_ID;

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const targetScrollFieldId = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const { activeTabConfig, invalidTabsList, isWholeFormValid, hasNextStep, currIdx } = useMemo(() => {
    const config = TabsConfig.find((t) => t.id === activeTabId) || TabsConfig[0];
    
    const invalidList = TabsConfig.filter(t => {
      if (t.skipCondition && finalMasterData[t.skipCondition.field] === t.skipCondition.value) return false;
      const s = tabStatus[t.id];
      if (s === 'SKIPPED' || s === 'VALID') return false;
      if (s === 'INVALID') return true;
      return (t.fields ? t.fields.some(f => f.required) : false) && !visitedTabs[t.id];
    }).map(t => t.label);

    return {
      activeTabConfig: config,
      invalidTabsList: invalidList,
      isWholeFormValid: invalidList.length === 0,
      hasNextStep: TabsConfig.findIndex((t) => t.id === activeTabId) < TabsConfig.length - 1,
      currIdx: TabsConfig.findIndex((t) => t.id === activeTabId)
    };
  }, [activeTabId, tabStatus, visitedTabs, finalMasterData]);

  const isTabCurrentlyValidToProceed = useMemo(() => {
    if (activeTabConfig?.skipCondition && finalMasterData[activeTabConfig.skipCondition.field] === activeTabConfig.skipCondition.value) {
      return true;
    }
    return tabStatus[activeTabId] === 'VALID' || tabStatus[activeTabId] === 'OPTIONAL';
  }, [activeTabId, tabStatus, activeTabConfig, finalMasterData]);

  const executeScroll = () => {
    const targetId = targetScrollFieldId.current;
    if (!targetId) return;
    targetScrollFieldId.current = null;
    
    setTimeout(() => {
      const el = document.querySelector(`[data-field="${targetId}"]`) || 
                 document.getElementById(targetId) || 
                 document.querySelector(`[name="${targetId}"]`);
      
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.transition = 'all 500ms ease';
        el.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.4)';
        el.style.backgroundColor = 'rgba(238, 242, 255, 0.4)';
        
        setTimeout(() => {
          el.style.boxShadow = '';
          el.style.backgroundColor = '';
        }, 2000);
      }
    }, 250); 
  };

  useEffect(() => {
    if (targetScrollFieldId.current && !isLoading) executeScroll();
  }, [activeTabId, isLoading]);

  const executeDraftSave = (destinationTabId = null, isManualTrigger = false) => {
    const operationalFieldsWithContent = Object.entries(finalMasterData).filter(([key, value]) => {
      if (key.endsWith('_unit') || key === 'status' || key === 'batchId') return false; 
      const hasContent = value !== '' && value !== false && value !== null && value !== undefined && !(Array.isArray(value) && value.length === 0) && !(typeof value === 'string' && value.trim() === '');
      return hasContent;
    });

    if (operationalFieldsWithContent.length === 0) {
      console.log("AUTO-SAVE BLOCKED: Form is verified completely blank. Exiting safely.");
      if (isManualTrigger) {
        setShowEmptyDraftWarning(true);
      }
      return false; 
    }

    console.log("SAVE PERMITTED!");

    const structuredDataGroups = buildTabGroupedPayload(finalMasterData, databaseLookups);
    const metricsPayload = { 
      isSubmitted: false, 
      lastSavedTimestamp: new Date().toISOString(), 
      payload: { 
        batchId: sessionBatchId,         
        status: isExistingSubmission ? "PENDING REVISION" : "DRAFT",
        dataGroups: structuredDataGroups,
        rawFormData: finalMasterData,
        activeTab: destinationTabId || activeTabId,
        tabStatus: tabStatus,
        visitedTabs: visitedTabs  
      }
    };

    dispatch(saveOrUpdateLog(metricsPayload));
    localStorage.setItem("plant_form_draft", JSON.stringify(metricsPayload));
    console.log("Draft Saved! : ", metricsPayload);

    if (isManualTrigger) {
      setShowDraftSuccess(true);
    }

    return true; 
  };

  const executeSilentDraftBackup = (destinationTabId) => {
    executeDraftSave(destinationTabId, false);
  };

  const handleSaveDraftManual = () => {
    executeDraftSave(null, true);
  };

  const handleFinalSubmit = () => {
    const structuredDataGroups = buildTabGroupedPayload(finalMasterData, databaseLookups);
    
    const metricsPayload = {
      isSubmitted: true,
      lastSavedTimestamp: new Date().toISOString(),
      payload: {
        batchId: sessionBatchId, 
        status: isExistingSubmission ? "REVISED" : "COMPLETED",
        dataGroups: structuredDataGroups,
        rawFormData: finalMasterData
      }
    };

    dispatch(saveOrUpdateLog(metricsPayload));
    localStorage.removeItem("plant_form_draft");
    setShowPreviewModal(false);
    setIsSubmitted(true);
  };

  const changeTab = (targetTabId) => {
    if (targetTabId === activeTabId) return;
    const targetIdx = TabsConfig.findIndex(t => t.id === targetTabId);
    if (targetIdx === -1) return;
    
    executeSilentDraftBackup(targetTabId);
    startTransition(() => {
      dispatch(initializeTabFields({ tabId: TabsConfig[targetIdx].id, fields: TabsConfig[targetIdx].fields }));
      dispatch(markTabAsVisited({ tabId: activeTabId }));
      dispatch(setActiveTab(TabsConfig[targetIdx].id));
      setShowWarning(false);
    });
  };
  
  const handleReset = async () => {
    localStorage.removeItem("plant_form_draft");
    dispatch(resetForm());
    dispatch(setActiveTab(INITIAL_TAB_ID));
  };

  if (isLoading) 
    return 
    <div className="MultiTabForm min-h-[60vh] flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin">
      </div>
    </div>;
  
  if (isSubmitted) {
    return (
      <div className="p-6 bg-green-50 border border-green-400 rounded text-center max-w-md mx-auto my-8 submitted-view-card">
        <h1 className="text-xl font-bold text-green-700">Entries Saved</h1>
        <div className="flex flex-col gap-2 mt-4 button-stack-vertical">
          <button onClick={() => { setIsSubmitted(false); handleReset(); }} className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 btn-reset-complete">
            Reset and Log New Batch
          </button>
          <button onClick={BackToDash} className="text-sm font-semibold text-slate-500 hover:text-slate-800 mt-2 link-dash-return">
            Go to Log Explorer Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-outer-wrapper">
      <div className='FormButtonsHeader'>
        <button 
          className="BackToDash" 
          onClick={() => {
            executeSilentDraftBackup(); 
            BackToDash();              
          }}
        >
          <span>← </span>Back to Dashboard
        </button>
        
        <FormSearch onJumpToField={(match) => { targetScrollFieldId.current = match.fieldId; activeTabId !== match.tabId ? changeTab(match.tabId) : executeScroll(); }} />
      </div>

      <div className="MultiTabForm form-card-container">
        <TabScroller tabsConfig={TabsConfig} activeTabId={activeTabId} visitedTabs={visitedTabs} tabStatus={tabStatus} onTabSelect={changeTab} />

        <div className="Content form-body-content">
          <FormTab key={activeTabId} tabConfig={activeTabConfig} />
        </div>
        
        <div className="form-stepper-footer">
          <FormActionRow 
            currIdx={currIdx} 
            hasNextStep={hasNextStep} 
            isTabValid={isTabCurrentlyValidToProceed}
            isSkipActive={activeTabConfig?.skipCondition && finalMasterData[activeTabConfig.skipCondition.field] === activeTabConfig.skipCondition.value}
            onPrevious={() => { const prevIdx = currIdx - 1; if (prevIdx >= 0) changeTab(TabsConfig[prevIdx].id); }}
            onNext={() => { const nextIdx = currIdx + 1; if (nextIdx < TabsConfig.length) changeTab(TabsConfig[nextIdx].id); }}
            onResetClick={() => setShowResetConfirm(true)}
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2 form-actions-footer">
        <button type="button" onClick={handleSaveDraftManual} className="customSaveDraft m-0 btn-save-draft">Save Draft</button>
        
        <div className="relative inline-block btn-submit-wrapper" onMouseEnter={() => setShowWarning(true)} onMouseLeave={() => setShowWarning(false)} onClick={() => !isWholeFormValid && setShowWarning(true)}>
          <SubmitTooltip show={showWarning} invalidTabs={invalidTabsList} />

          <button 
            type="button" 
            onClick={() => isWholeFormValid && setShowPreviewModal(true)} 
            className={isWholeFormValid ? "activeCustomNext bg-emerald-600 hover:bg-emerald-700 btn-submit active" : "inactiveCustomNext btn-submit inactive"} 
            disabled={!isWholeFormValid}
          >
            Submit Form
          </button>
        </div>
      </div>
      
      <Modal
        isOpen={showDraftSuccess}
        title="Draft Progress Saved"
        message="Your current operational logging snapshot parameters have been successfully baked down and backed up locally. You can safely exit or continue updating fields."
        confirmText="Acknowledge"
        variant="success"
        onConfirm={() => setShowDraftSuccess(false)}
      />

      <Modal
        isOpen={showEmptyDraftWarning}
        title="Cannot Save Blank Draft"
        message="This operation was blocked because the field parameters across all tabs are completely empty. Please input at least one field measurement before backing up a working operational draft."
        confirmText="Return to Form"
        variant="danger"
        onConfirm={() => setShowEmptyDraftWarning(false)}
      />

      <FormPreviewModal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} formData={finalMasterData} databaseLookups={databaseLookups} onConfirm={handleFinalSubmit} onChangeTab={changeTab} />
      <Modal isOpen={showResetConfirm} title="Clear Entire Batch Progress?" message="Are you sure you want to permanently wipe values across all tabs?" confirmText="Yes, Wipe Progress" cancelText="No, Keep Data" variant="danger" onConfirm={() => { handleReset(); setShowResetConfirm(false); }} onCancel={() => setShowResetConfirm(false)} />
    </div>
  );
}

export default MultiTabForm;