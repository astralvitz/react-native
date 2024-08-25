import axios from "axios";
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { URL } from '../actions/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
    statsErrorMessage: null,
    totalLitter: 0,
    totalPhotos: 0,
    totalUsers: 0,
    totalLittercoin: 0,
    targetPercentage: 0,
    litterTarget: {
        previousTarget: 0,
        nextTarget: 0
    }
};

export const getStats = createAsyncThunk(
    'stats/getStats',
    async (_, { rejectWithValue }) => {
        try
        {
            const response = await axios({
                url: `${URL}/api/global/stats-data`,
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                }
            });

            return response.data;
        }
        catch (error)
        {
            return (error.response)
                ? rejectWithValue('Something went wrong, please try again')
                : rejectWithValue('Network Error, please try again');
        }
    }
);

const statsSlice = createSlice({

    name: 'stats',

    initialState,

    reducers: {},

    extraReducers: (builder) => {

        builder

            .addCase(getStats.pending, (state) => {
                state.statsErrorMessage = null;
            })
            .addCase(getStats.fulfilled, (state, action) => {

                const totalLitter = action.payload?.total_litter || 1;
                const totalPhotos = action.payload?.total_photos || 1;
                const totalUsers = action.payload?.total_users || 1;
                const totalLittercoin = parseInt(action.payload?.littercoin);
                const litterTarget = {
                    previousTarget: action.payload.previousXp,
                    nextTarget: action.payload.nextXp
                };
                const targetPercentage =
                    ((totalLitter - litterTarget.previousTarget) /
                        (litterTarget.nextTarget -
                            litterTarget.previousTarget)) *
                    100;

                AsyncStorage.setItem(
                    'globalStats',
                    JSON.stringify({
                        totalLitter,
                        totalPhotos,
                        totalUsers,
                        totalLittercoin,
                        litterTarget,
                        targetPercentage
                    })
                );

                state.totalLitter = totalLitter;
                state.totalPhotos = totalPhotos;
                state.totalUsers = totalUsers;
                state.totalLittercoin = totalLittercoin;
                state.litterTarget = litterTarget;
                state.targetPercentage = targetPercentage;
                state.statsErrorMessage = null;
            })
            .addCase(getStats.rejected, (state, action) => {
                state.statsErrorMessage = action.payload;
            });
    }
});

export const {  } = statsSlice.actions;
export default statsSlice.reducer;
