import { createSlice } from '@reduxjs/toolkit';

export const explorerSlice = createSlice({
  name: 'explorerData', 
  initialState: {
    allLogs: [] 
  },
  reducers: {
    saveOrUpdateLog: (state, action) => {
      const incomingBatchId = action.payload?.payload?.batchId;

      const existingIndex = state.allLogs.findIndex(
        (item) => item.payload?.batchId === incomingBatchId
      );

      if (existingIndex !== -1) {
        state.allLogs[existingIndex] = action.payload;
      } else {
        state.allLogs.unshift(action.payload);
      }
    }
  }
});

export const { saveOrUpdateLog } = explorerSlice.actions;
export default explorerSlice.reducer;