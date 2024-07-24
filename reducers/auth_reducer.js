import axios from "axios";
import * as Sentry from "@sentry/react-native";
import { XPLEVEL } from '../assets/data/xpLevel';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { CLIENT_ID, CLIENT_SECRET, URL } from  '../actions/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// import * as RNLocalize from 'react-native-localize';
// let lang = RNLocalize.getLocales().languageCode || 'en';

const initialState = {
    lang: 'en',
    appVersion: '',
    isSubmitting: false,
    token: null,
    tokenIsValid: false,
    user: null,
    serverStatusText: '',
    errors: {}
};

/**
 * API List
 *
 * 1. checkValidToken
 * 2. createUser
 * 3. fetchUser
 * 4. sendResetPasswordRequest
 * 4. userLogin
 */

/**
 * Check if the token is valid
 *
 * It will return "valid" if the user is logged in
 *
 * Or  "Unauthenticated." if they are logged out / not valid
 */
export const checkValidToken = createAsyncThunk(
    'auth/checkValidToken',
    async (jwt, { rejectWithValue }) => {
        try {
            const response = await axios({
                url: `${URL}/api/validate-token`,
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    Accept: 'application/json'
                }
            });

            return (response.data.hasOwnProperty('message') && response.data.message === 'valid');
        }
        catch (error) {
            return rejectWithValue('Please login again.');
        }
    }
);


export const createAccount = createAsyncThunk(
    'auth/createAccount',
    async ({ username, email, password }, { rejectWithValue, dispatch }) => {
        try
        {
            const response = await axios.post(`${URL}/api/register`, {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'password',
                username: username,
                email: email,
                password: password
            }, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log(response);

            dispatch(userLogin({ email, password }));

            return response.data;
        }
        catch (error)
        {
            console.log({ error })

            if (error.response)
            {
                const errorData = error.response.data.errors;

                if (errorData) {
                    if (errorData.email) return rejectWithValue(errorData.email);
                    if (errorData.username) return rejectWithValue(errorData.username);
                    if (errorData.password) return rejectWithValue(errorData.password);
                }

                return rejectWithValue('Something went wrong, please try again');
            }
            else {
                return rejectWithValue('Network error, please check your internet connection.');
            }
        }
    }
);


export const fetchUser = createAsyncThunk(
    'auth/fetchUser',
    async (token, { rejectWithValue }) => {
        try
        {
            const response = await axios({
                url: `${URL}/api/user`,
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200 && response.data) {
                Sentry.setUser({
                    id: response.data.id,
                    email: response.data?.email,
                });

                return response.data;
            } else {
                return rejectWithValue('User fetch failed');
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message || 'Network error, please try again');
        }
    }
);


export const sendResetPasswordRequest = createAsyncThunk(
    'user/sendResetPasswordRequest',
    async (email, { rejectWithValue }) => {
        try
        {
            const response = await axios.post(`${URL}/api/password/email`, {
                email
            }, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        }
        catch (error)
        {
            if (error.response) {
                // Log the error and return a rejected value with an error message
                // console.log('sendResetPasswordRequest', error.response.data);
                return rejectWithValue('Error, please try again');
            } else {
                // console.log('sendResetPasswordRequest', error);
                return rejectWithValue('Network error, please try again');
            }
        }
    }
);


export const userLogin = createAsyncThunk(
    'auth/userLogin',
    async ({ email, password }, { rejectWithValue, dispatch }) => {
        try
        {
            const response = await axios({
                url: `${URL}/oauth/token`,
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                data: {
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    grant_type: 'password',
                    username: email,
                    password: password
                }
            });

            if (response.status === 200) {
                const token = response.data.access_token;

                try
                {
                    await AsyncStorage.setItem('jwt', token);
                }
                catch (error)
                {
                    console.log('userLogin.saveJWT', error);

                    return rejectWithValue('Unable to save token to asyncstore');
                }

                dispatch(fetchUser(token));

                return token;
            } else {
                return rejectWithValue('Login failed');
            }
        } catch (error) {
            // This handles any network or other errors
            return rejectWithValue(error.response?.data || error.message || 'Network error, please try again');
        }
    }
);

const authSlice = createSlice({

    name: 'auth',

    initialState,

    reducers: {

        changeActiveTeam (state, action) {
            state.user.active_team = action.payload;
        },

        /**
         * Change app language
         * Language changeable from WelcomeScreen -- LanguageFlags.js
         */
        changeLang (state, action) {
            state.lang = action.payload;
        },

        /**
         * Logout user
         * reset state to initial
         */
        logout (state) {
            AsyncStorage.clear();

            return initialState;
        },

        /**
         * Resets the auth form and display messages
         */
        loginOrSignupReset (state) {
            state.isSubmitting = false;
            state.serverStatusText = '';
        },

        /**
         * Update user object after userdata changed from settings
         */
        updateUserObject (state, action) {
            state.user = action.payload;
        }
    },

    extraReducers: (builder) => {

        builder

            // Check Valid Token
            .addCase(checkValidToken.fulfilled, (state) => {
                state.isValidToken = true;
            })
            .addCase(checkValidToken.rejected, (state) => {
                state.isValidToken = false;
            })

            // Create Account
            .addCase(createAccount.pending, (state) => {
                state.serverStatusText = "";
                state.isSubmitting = true;
            })
            .addCase(createAccount.fulfilled, (state) => {
                state.isSubmitting = false;
            })
            .addCase(createAccount.rejected, (state, action) => {
                state.isSubmitting = false;
                state.serverStatusText = action.payload;
            })


            // Fetch User
            .addCase(fetchUser.fulfilled, (state, action) => {

                let user = action.payload;

                /**
                 * If user logged in
                 * process user data and calculate
                 *   user level -- based on user xp breakdown from ../screens/pages/data/xpLevel
                 *   targetPercentage -- percentage completed to reach next level from prev level xp
                 *   totalTags added by user
                 *   totalLittercoin of user -- littercoin_allowance + littercoin_owed
                 */
                const level = XPLEVEL.findIndex(xp => xp > user.xp_redis);
                const xpRequired = XPLEVEL[level] - user.xp_redis;
                const previousTarget = level > 0 ? XPLEVEL[level - 1] : 0;
                const targetPercentage = ((user.xp_redis - previousTarget) / (XPLEVEL[level] - previousTarget)) * 100;

                user = {
                    ...user,
                    level: level,
                    xpRequired: xpRequired,
                    targetPercentage: targetPercentage,
                    totalTags: user.total_tags,
                    totalLittercoin: (user.littercoin_allowance || 0) + (user.littercoin_owed || 0)
                };

                AsyncStorage.setItem('user', JSON.stringify(user));

                state.user = user;
                state.isSubmitting = false;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.serverStatusText = action.payload;
                state.isSubmitting = false;
            })

            // Send Reset Password Request
            .addCase(sendResetPasswordRequest.pending, (state) => {
                state.isSubmitting = true;
            })
            .addCase(sendResetPasswordRequest.fulfilled, (state) => {
                state.isSubmitting = false;
                state.serverStatusText = 'An email will be sent if the address exists.'
            })
            .addCase(sendResetPasswordRequest.rejected, (state) => {
                state.serverStatusText = 'An email will be sent if the address exists.'
                state.isSubmitting = false;
            })

            // User Login
            .addCase(userLogin.pending, (state) => {
                state.isSubmitting = true;
            })
            .addCase(userLogin.fulfilled, (state, action) => {
                state.token = action.payload;
                state.errors = {};
                // state.isSubmitting = false;
            })
            .addCase(userLogin.rejected, (state, action) => {
                state.serverStatusText = action.payload.message;
                state.isSubmitting = false;
            })
    }
});

export const {
    changeActiveTeam, changeLang,
    accountCreated, logout, loginOrSignupReset, tokenIsValid,
    userFound, updateUserObject
} = authSlice.actions;

export default authSlice.reducer;
