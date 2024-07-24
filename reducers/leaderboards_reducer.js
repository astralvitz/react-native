import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
import { createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    paginated: {
        users: []
    }
};

const getLeaderboardData = createAsyncThunk(
    'leaderboard/fetchLeaderboardData',
    async (leaderboardData, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${URL}/global/leaderboard?timeFilter=${leaderboardData}`, {
                headers: {
                    Accept: 'application/json'
                }
            });

            if (response.data.success) {
                return response.data;
            } else {
                return rejectWithValue("Error");
            }
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const leaderboardsSlice = createSlice({

    name: 'leaderboards',

    initialState,

    extraReducers: (builder) => {

        builder

            .addCase(getLeaderboardData.pending, (state, action) => {
                // no action yet
            })
            .addCase(getLeaderboardData.fulfilled, (state, action) => {
                state.paginated = action.payload;
            })
            .addCase(getLeaderboardData.rejected, (state, action) => {
                // no action yet
            })
    }
});

export const { updateLeaderboards } = leaderboardsSlice.actions;

export default leaderboardsSlice.reducer;
