import { useMemo } from 'react';

const PARSE_STRATEGY = {
  C: (v) => v,
  F: (v) => (v - 32) * 5 / 9,
  K: (v) => v - 273.15,
  bar: (v) => v,
  psi: (v) => v * 0.0689476,
  mpa: (v) => v * 10,
  kg_h: (v) => v,
  lb_h: (v) => v * 0.45359237
};

const MOC_STRENGTHS = { cs: 50, inconel: 150, hastelloy: 180 };

const parseNum = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

function computeDensityProfile(formData) {
  const phase = formData.fluid_phase || "";
  const isGas = phase === "gas";
  const isLiquid = phase === "liquid";
  
  return {
    density: isGas ? "~ 1.2 to 12.0 kg/m³" : isLiquid ? "~ 780 to 1,000 kg/m³" : "---",
    zFactor: isGas ? "Z ≈ 0.92" : isLiquid ? "Z ≈ 0.01" : "N/A"
  };
}

function computeThermodynamics(formData) {
  const rawTemp = parseNum(formData.op_temp);
  const T = (PARSE_STRATEGY[formData.op_temp_unit] || PARSE_STRATEGY.C)(rawTemp);

  const rawPress = parseNum(formData.design_press);
  const designP = (PARSE_STRATEGY[formData.design_press_unit] || PARSE_STRATEGY.bar)(rawPress);

  const selectedMOC = formData.moc || '';
  let maxSafePressure = 0;
  let pressureStatusString = "Awaiting Input...";

  if (selectedMOC && rawTemp !== 0) {
    const baseStrength = MOC_STRENGTHS[selectedMOC] || 100;
    const temperatureFactor = Math.max(0.2, 1 - (T / 800));
    maxSafePressure = Math.round(baseStrength * temperatureFactor * 10) / 10;
    
    if (designP > maxSafePressure) {
      pressureStatusString = "HAZARD: EXCEEDED LIMIT";
    } else if (designP >= maxSafePressure * 0.9) {
      pressureStatusString = "WARNING: NEARING LIMIT";
    } else {
      pressureStatusString = "SAFE: NORMAL REGIME";
    }
  }

  return {
    selectedMOCOutput: selectedMOC ? selectedMOC.toUpperCase() : "None Selected (Tab 2)",
    maxSafePressureOutput: maxSafePressure > 0 ? `${maxSafePressure} bar` : "---",
    isPressureExceeded: pressureStatusString
  };
}

function computeHydraulicsThrottle(formData) {
  const outputs = {};
  const valveLoops = [1, 2, 3, 4, 5, 6];
  
  valveLoops.forEach(num => {
    const selection = formData[`hydraulics_throttle_type_${num}`] || "";
    let calculatedMetric = "0.00 m³/s (Vessel Idle)";
    
    if (selection === "type_a") {
      calculatedMetric = "1.45 m³/s (Max Capacity Open)";
    } else if (selection === "type_b") {
      calculatedMetric = "0.62 m³/s (Precision Throttled)";
    } else if (selection === "type_c") {
      calculatedMetric = "0.00 m³/s (Safe Closed State)";
    }
    
    outputs[`throttleOutputMetric_${num}`] = calculatedMetric;
  });

  return outputs;
}

function computeAdvancedRoutingThrottle(formData) {
  const outputs = {};
  
  for (let num = 1; num <= 10; num++) {
    const selection = formData[`route_valve_${num}`] || "";
    let calculatedMetric = "0.00 m³/s (Route Isolated)";
    
    if (selection === "type_x") {
      calculatedMetric = "5.00 m³/s (Max Flow Active)";
    } else if (selection === "type_y") {
      calculatedMetric = "2.25 m³/s (Metered Control)";
    } else if (selection === "type_z") {
      calculatedMetric = "0.00 m³/s (Fail-Safe Lock)";
    }
    
    outputs[`routeOutputMetric_${num}`] = calculatedMetric;
  }

  return outputs;
}

function computeReynoldsRegime(formData) {
  const rawFlow = parseNum(formData.flow_rate);
  const Q = (PARSE_STRATEGY[formData.flow_rate_unit] || PARSE_STRATEGY.kg_h)(rawFlow);
  const mu = parseNum(formData.viscosity);
  
  let reynoldsNumber = 0;
  let flowRegime = "Awaiting parameters...";

  if (Q > 0 && mu > 0) {
    const pipeDiameter = 0.154;
    const viscosityInPascalSeconds = mu * 0.001;
    const denominator = Math.PI * pipeDiameter * viscosityInPascalSeconds;
    
    if (denominator > 0) {
      const massFlowRatePerSecond = Q / 3600;
      reynoldsNumber = Math.round((4 * massFlowRatePerSecond) / denominator);
      flowRegime = reynoldsNumber < 2100 ? "Laminar" : reynoldsNumber <= 4000 ? "Transient" : "Turbulent";
    }
  }

  return {
    reynoldsNumber: reynoldsNumber > 0 ? reynoldsNumber.toLocaleString() : "---",
    flowRegime
  };
}

function computeSchemaMath(formData, calcConfig) {
  const outputs = {};

  if (calcConfig && calcConfig.outputs) {
    calcConfig.outputs.forEach(outputConfig => {
      if (outputConfig.formula) {
        try {
          let mathString = outputConfig.formula;
          const variables = mathString.match(/\[(.*?)\]/g) || [];
          let hasMissingData = false;

          variables.forEach(variable => {
            const fieldId = variable.replace(/\[|\]/g, '');
            const rawValue = parseFloat(formData[fieldId]);
            
            if (isNaN(rawValue)) {
              hasMissingData = true;
            } else {
              mathString = mathString.replace(variable, rawValue);
            }
          });

          if (!hasMissingData) {
            const result = new Function(`return ${mathString}`)();
            if (outputConfig.decimals !== undefined) {
              outputs[outputConfig.metricKey] = result.toFixed(outputConfig.decimals);
            } else {
              outputs[outputConfig.metricKey] = result;
            }
          } else {
            outputs[outputConfig.metricKey] = "Awaiting Input...";
          }
        } catch (error) {
          console.error(`Error calculating formula for ${outputConfig.metricKey}:`, error);
          outputs[outputConfig.metricKey] = "Math Error";
        }
      }
    });
  }

  return outputs;
}

export function useProcessTelemetry(formData, activeTabConfig = null) {
  return useMemo(() => {
    const defaultMetrics = {
      density: "---",
      zFactor: "N/A",
      selectedMOCOutput: "None Selected (Tab 2)",
      maxSafePressureOutput: "---",
      isPressureExceeded: "Awaiting Input...",
      tempMargin: "Awaiting Input...",
      pressureRatio: "Awaiting Input...",
      residenceTime: "Awaiting Input...",
      reynoldsNumber: "---",
      flowRegime: "Awaiting parameters..."
    };

    if (!activeTabConfig?.calculations) {
      return {
        ...defaultMetrics,
        ...computeDensityProfile(formData),
        ...computeThermodynamics(formData),
        ...computeHydraulicsThrottle(formData),
        ...computeReynoldsRegime(formData)
      };
    }

    const runningMetrics = {};
    activeTabConfig.calculations.forEach(calc => {
      switch (calc.type) {
        case "PHASE_DENSITY_ESTIMATION":
          Object.assign(runningMetrics, computeDensityProfile(formData));
          break;
        case "THERMO_SAFETY_ENVELOPE":
          Object.assign(runningMetrics, computeThermodynamics(formData));
          break;
        case "HYDRAULICS_THROTTLE_PAIR":
          Object.assign(runningMetrics, computeHydraulicsThrottle(formData));
          break;
        case "ADVANCED_ROUTING_THROTTLE":
          Object.assign(runningMetrics, computeAdvancedRoutingThrottle(formData));
          break;
        case "REYNOLDS_FLOW_REGIME":
          Object.assign(runningMetrics, computeReynoldsRegime(formData));
          break;
        case "SCHEMA_MATH":
          Object.assign(runningMetrics, computeSchemaMath(formData, calc));
          break;
        default:
          break;
      }
    });

    return {
      ...defaultMetrics,
      ...runningMetrics
    };
  }, [formData, activeTabConfig]);
}