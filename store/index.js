import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { rootReducer } from '../reducers';

// Configuration for Redux Persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Specify which reducers should be stored
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default function configureAppStore(initialState = {}) {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            // Ignore these action types in the serializability check
            ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
          },
        }).concat(__DEV__ ? [require('redux-immutable-state-invariant').default()] : []),
    preloadedState: initialState,
    devTools: __DEV__, // Automatically enable/disable Redux DevTools
  });

  const persistor = persistStore(store);

  return { store, persistor };
}
