import axios from "axios";
import * as Sentry from "@sentry/react-native";
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { URL } from '../actions/types';

const initialState = {
    uploaded: 0,
    uploadedFailed: 0,
    tagged: 0,
    taggedFailed: 0,

    alreadyUploaded: 0,
    invalidCoordinates: 0,
    unknown: 0
};

export const uploadImageAsync = createAsyncThunk(
    'images/uploadImage',
    async ({ imageData, token }, { rejectWithValue }) => {
        try {
            const response = await axios({
                method: 'POST',
                url: URL + '/api/photos/upload/with-or-without-tags',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                data: imageData
            });
            const data = await response.json();

            return data;

        }
        catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const uploadSlice = createSlice({

    name: 'upload',

    initialState,

    reducers: {

        resetUploadState (state) {
            state.uploaded = 0;
            state.uploadedFailed = 0;
            state.tagged = 0;
            state.taggedFailed = 0;
            state.alreadyUploaded = 0;
            state.invalidCoordinates = 0;
            state.unknown = 0;
        }

    }
});

export const { resetUploadState } = uploadSlice.actions;

export default uploadSlice.reducer;
