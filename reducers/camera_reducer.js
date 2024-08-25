import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    lat: null,
    lon: null
};

const cameraSlice = createSlice({

    name: 'camera',

    initialState,

    reducers: {
        setGpsCoordinates(state, action) {
            state.lat = action.payload.lat;
            state.lon = action.payload.lon;
        }
    }
});

export const { setGpsCoordinates } = cameraSlice.actions;

export default cameraSlice.reducer;
