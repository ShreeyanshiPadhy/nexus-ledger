import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadExistingRecord, resetForm } from '../store/formSlice';

export default function Dashboard({ LogNewEntry, onSelectEditEntry }) {
    const savedLogs = useSelector((state) => state.explorerData.allLogs);
    const [searchTerm, setSearchTerm] = useState("");
    const dispatch = useDispatch();

    const statsSummary = useMemo(() => {
        let draftCount = 0;
        let completedCount = 0;
        let pendingRevisionCount = 0;
        let revisedCount = 0;

        savedLogs.forEach((item) => {
            const currentStatus = item.payload?.status || "DRAFT";
            if (currentStatus === "DRAFT") draftCount++;
            else if (currentStatus === "COMPLETED") completedCount++;
            else if (currentStatus === "PENDING REVISION") pendingRevisionCount++;
            else if (currentStatus === "REVISED") revisedCount++;
        });

        return {
            draft: draftCount,
            completed: completedCount,
            pendingRevision: pendingRevisionCount,
            revised: revisedCount,
            total: savedLogs.length
        };
    }, [savedLogs]);

    return (
        <div className="dashboard-container">
            
            <div className="dashboard-header">
                <h2 className="dashboard-title">My Requests Log Explorer</h2>
                <button 
                    className="btn-primary"
                    onClick={() => {
                        dispatch(resetForm());
                        LogNewEntry();
                    }}
                >
                    <span className="btn-plus-icon">+</span> Add New Log
                </button>
            </div>

            <div className="dashboard-stats-grid">
                <div className="stat-card stat-draft">
                    <span className="stat-label">Draft Batches</span>
                    <span className="stat-value">{statsSummary.draft}</span>
                </div>
                <div className="stat-card stat-completed">
                    <span className="stat-label">Submitted Logs</span>
                    <span className="stat-value">{statsSummary.completed}</span>
                </div>
                <div className="stat-card stat-pending">
                    <span className="stat-label">In Revision Drafts</span>
                    <span className="stat-value">{statsSummary.pendingRevision}</span>
                </div>
                <div className="stat-card stat-revised">
                    <span className="stat-label">Amended Logs</span>
                    <span className="stat-value">{statsSummary.revised}</span>
                </div>
            </div>

            {savedLogs.length > 0 ? (
                <div className="table-wrapper">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th className="table-header-cell" style={{ width: '8%' }}>S.No.</th>
                                <th className="table-header-cell" style={{ width: '22%' }}>Batch ID</th>
                                <th className="table-header-cell" style={{ width: '18%' }}>Status</th>
                                <th className="table-header-cell" style={{ width: '32%' }}>Last Saved Timestamp</th>
                                <th className="table-header-cell" style={{ width: '20%', textAlign: 'center' }}>Available Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {savedLogs.map((item, index) => {
                                const payloadData = item.payload || {};
                                const currentStatus = payloadData.status || "DRAFT";

                                return (
                                    <tr key={payloadData.batchId} className="row-interactive">
                                        
                                        <td className="table-data-cell cell-muted font-mono">
                                            {String(index + 1).padStart(2, '0')}
                                        </td>

                                        <td className="table-data-cell cell-bold">
                                            {payloadData.batchId || "Unknown"}
                                        </td>

                                        <td className="table-data-cell">
                                            <span className={`badge ${
                                                currentStatus === 'DRAFT' ? 'badge-draft' :
                                                currentStatus === 'COMPLETED' ? 'badge-complete' :
                                                currentStatus === 'PENDING REVISION' ? 'badge-pending-revision' :
                                                currentStatus === 'REVISED' ? 'badge-revised' : ''
                                            }`}>
                                                {currentStatus}
                                            </span>
                                        </td>

                                        <td className="table-data-cell cell-muted">
                                            {item.lastSavedTimestamp 
                                                ? new Date(item.lastSavedTimestamp).toLocaleString([], { 
                                                    dateStyle: 'medium', 
                                                    timeStyle: 'short' 
                                                  }) 
                                                : '—'
                                            }
                                        </td>

                                        <td className="table-data-cell" style={{ textAlign: 'center' }}>
                                            <button 
                                                className="btn-action"
                                                onClick={() => {
                                                    if (payloadData.rawFormData) {
                                                        dispatch(loadExistingRecord({
                                                            rawFormData: payloadData.rawFormData,
                                                            batchId: payloadData.batchId,
                                                            activeTab: payloadData.activeTab,
                                                            tabStatus: payloadData.tabStatus,
                                                            visitedTabs: payloadData.visitedTabs
                                                        }));
                                                    }
                                                    onSelectEditEntry();
                                                }} 
                                            >
                                                {currentStatus === 'DRAFT' || currentStatus === 'PENDING REVISION' ? "Resume Draft" : "View / Edit"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="table-wrapper">
                    <div className="empty-state">
                        <p>No logged process batches detected in your local ledger history.</p>
                    </div>
                </div>
            )}
        </div>
    );
}