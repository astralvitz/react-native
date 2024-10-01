import axios from "axios";
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { URL } from  '../actions/types';

const initialState = {
    uploads: [],
    loading: false,
    error: null
};

export const fetchUploads = createAsyncThunk(
    'myUploads/fetchUploads',
    async ({
       token,
       page,
       paginationAmount,
       filterCountry,
       filterDateFrom,
       filterDateTo,
       filterTag,
       filterCustomTag
    }, { rejectWithValue }
    ) => {
        try {
            const response = await axios({
                method: 'GET',
                url: `${URL}/history/paginated`,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    page,
                    paginationAmount,
                    filterCountry,
                    filterTag,
                    filterCustomTag,
                    filterDateFrom,
                    filterDateTo
                }
            });

            console.log('response', response.data.photos.data.length);
            console.log('response', response.data.photos.data[0]);

            return response.data.photos.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to load uploads');
        }
    }
);

const myUploadsSlice = createSlice({

    name: 'myUploads',

    initialState,

    reducers: {
        clearUploads: (state) => {
            state.uploads = [];
        }
    },

    extraReducers: (builder) => {

        builder

            .addCase(fetchUploads.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUploads.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.uploads = action.payload;
            })
            .addCase(fetchUploads.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearUploads } = myUploadsSlice.actions;
export default myUploadsSlice.reducer;
