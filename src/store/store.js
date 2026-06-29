import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/es/storage';
import formInfoReducer from './formSlice';
import optionsLookupReducer from './optionsSlice';
import explorerReducer from './explorerSlice';

const persistConfig = {
  key: 'FormBatchLogs',
  storage,
};

const persistedReducer = persistReducer(persistConfig, formInfoReducer);

const explorerPersistConfig = {
  key: 'DashboardLedger',
  storage,
};
const persistedExplorerReducer = persistReducer(explorerPersistConfig, explorerReducer);

export const store = configureStore({
  reducer: {
    formInfo: persistedReducer,
    optionsLookup: optionsLookupReducer,
    explorerData : persistedExplorerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);