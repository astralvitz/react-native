// Import keys to authenticate with your Laravel backend
// See https://laravel.com/docs/8.x/passport#the-passportclient-command
import Config from 'react-native-config';

// Production
const SECRET_CLIENT = Config.SECRET_CLIENT;
const ID_CLIENT = Config.ID_CLIENT;
const OLM_ENDPOINT = Config.OLM_ENDPOINT;

// Local
const LOCAL_SECRET_CLIENT = Config.LOCAL_SECRET_CLIENT;
const LOCAL_ID_CLIENT = Config.LOCAL_ID_CLIENT;
const LOCAL_OLM_ENDPOINT = Config.LOCAL_OLM_ENDPOINT;

const CURRENT_ENVIRONMENT = Config.CURRENT_ENVIRONMENT;
console.log({ CURRENT_ENVIRONMENT });

// change this when working locally to disable sentry
export const IS_PRODUCTION = CURRENT_ENVIRONMENT === 'production';

let CLIENT = '';
let SECRET = '';
let ENDPOINT = '';

if (CURRENT_ENVIRONMENT === 'production') {
    CLIENT = ID_CLIENT;
    SECRET = SECRET_CLIENT;
    ENDPOINT = OLM_ENDPOINT;
}
else if (CURRENT_ENVIRONMENT === 'local') {
    CLIENT = LOCAL_ID_CLIENT;
    SECRET = LOCAL_SECRET_CLIENT;
    ENDPOINT = 'http://olm.test'; // LOCAL_OLM_ENDPOINT;
}

if (CURRENT_ENVIRONMENT !== 'production') {
    console.log('CLIENT', CLIENT);
    console.log('SECRET', SECRET);
    console.log('ENDPOINT', ENDPOINT);
}

export const CLIENT_ID = CLIENT;
export const CLIENT_SECRET = SECRET;
export const URL = ENDPOINT;
