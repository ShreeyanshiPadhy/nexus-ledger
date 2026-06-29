import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  metallurgySpecs: [
    { "label": "Carbon Steel (ASME A106 Grade B)", "value": "cs" },
    { "label": "Stainless Steel 316L (Low Carbon Austenitic)", "value": "ss316l" },
    { "label": "Inconel 625 Alloy (High Temperature)", "value": "inconel" },
    { "label": "Hastelloy C276 (Extreme Corrosion Defense)", "value": "hastelloy" }
  ],
  pipelineDestinations: [
    { "label": "Manifold Alpha (Standard Processing)", "value": "manifold_a" },
    { "label": "Manifold Beta (High Capacity)", "value": "manifold_b" },
    { "label": "Direct to Storage Farm", "value": "storage" }
  ],
  bypassProtocols: [
    { "label": "No Bypass (Straight Through)", "value": "none" },
    { "label": "Partial Recirculation (30%)", "value": "recirc_30" },
    { "label": "Full Reactor Bypass (100%)", "value": "recirc_100" }
  ]
};

export const optionsSlice = createSlice({
  name: 'optionsLookup',
  initialState,
  reducers: {
    setDatabaseOptions: (state, action) => {
      return { ...state, ...action.payload };
    }
  }
});

export const { setDatabaseOptions } = optionsSlice.actions;
export default optionsSlice.reducer;