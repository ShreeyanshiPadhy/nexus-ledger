import React from 'react';
import { useProcessTelemetry } from '../../hooks/useProcessTelemetry';

const getStatusPillClasses = (value) => {
  if (value === "Awaiting Input...") return { container: "pill-slate", dot: "dot-slate" };
  
  const text = String(value).toLowerCase();
  if (text.includes('optimal') || text.includes('active') || text.includes('safe')) {
    return { container: "pill-emerald", dot: "dot-emerald" };
  }
  if (text.includes('critical') || text.includes('danger') || text.includes('fail')) {
    return { container: "pill-rose", dot: "dot-rose" };
  }
  return { container: "pill-amber", dot: "dot-amber" };
};

const Calc = ({ config, formData }) => {
  const telemetryMetrics = useProcessTelemetry(formData, config);

  if (!config.calculations?.length) return null;

  return (
    <div className="telemetry-container">
      <div className="telemetry-card">
        
        <div className="telemetry-header">
          <h4 className="telemetry-header-title">
            Live Process Telemetry & Operational Analytics
          </h4>
        </div>

        <div className="telemetry-grid">
          {config.calculations.map((calcBlock, blockIdx) => (
            <React.Fragment key={`calc-block-${blockIdx}`}>
              {calcBlock.outputs?.map((output, outIdx) => {
                const rawValue = telemetryMetrics[output.metricKey] || "Awaiting Input...";
                const isPill = output.variant === 'statusPill';
                const pillStyles = getStatusPillClasses(rawValue);

                const variantClasses = {
                  bold: 'telemetry-val-bold',
                  indigo: 'telemetry-val-indigo',
                  dynamicRegime: 'telemetry-val-regime'
                };

                return (
                  <div key={`out-${outIdx}`} className="telemetry-metric-unit">
                    <span className="telemetry-metric-label">{output.label}</span>
                    
                    <div className="telemetry-val-wrapper">
                      {isPill ? (
                        <span className={`telemetry-pill-status ${pillStyles.container}`}>
                          {rawValue !== "Awaiting Input..." && (
                            <span className={`telemetry-dot ${pillStyles.dot}`}></span>
                          )}
                          {rawValue}
                        </span>
                      ) : (
                        <span className={variantClasses[output.variant] || 'telemetry-val-default'}>
                          {rawValue}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Calc;