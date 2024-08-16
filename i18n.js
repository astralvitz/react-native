import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { en } from './assets/langs/en';
import { ar } from './assets/langs/ar';
import { de } from './assets/langs/de';
import { es } from './assets/langs/es';
import { fr } from './assets/langs/fr';
import { ie } from './assets/langs/ie';
import { nl } from './assets/langs/nl';
import { pt } from './assets/langs/pt';

const resources = {
    en: { translation: en },
    ar: { translation: ar },
    de: { translation: de },
    es: { translation: es },
    fr: { translation: fr },
    ie: { translation: ie },
    nl: { translation: nl },
    pt: { translation: pt }
};

// Set default language
import * as RNLocalize from 'react-native-localize';
const defaultLang = RNLocalize.getLocales()[0].languageCode;
const langs = ['en', 'ar', 'de', 'es', 'fr', 'ie', 'nl', 'pt'];
const lng = langs.includes(defaultLang) ? defaultLang : 'en';

i18n.use(initReactI18next).init({

    compatibilityJSON: 'v3',

    resources,

    lng,

    fallbackLng: "en",

    interpolation: {
        escapeValue: false
    },

    react: {
        useSuspense: false
    }

});

export default i18n;
