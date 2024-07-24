import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { MainRoutes } from './routes';
// import { LanguageProvider } from 'react-native-translation';
// import { langs } from './assets/langs';
import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';
import configureAppStore from './store';
import { IS_PRODUCTION } from './actions/types';
import './i18n';
import { logout } from "./reducers/auth_reducer";

// import * as RNLocalize from 'react-native-localize';
// let lang2 = RNLocalize.getLocales().languageCode;
// let lang;
// if (!langs[lang]) {
//   lang = 'en';
// }

const lang = 'en';
const SENTRY_DSN = Config.SENTRY_DSN;
const { store, persistor } = configureAppStore();

const App = () => {
  if (IS_PRODUCTION) {
    Sentry.init({
      dsn: SENTRY_DSN
    });
  }

  // store.dispatch({type: 'CHANGE_LANG', payload: lang});

  return (
    <NavigationContainer>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <MainRoutes />
        </PersistGate>
      </Provider>
    </NavigationContainer>
  );
};

export default App;
