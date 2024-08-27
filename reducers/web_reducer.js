import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    count: 0, // This is the count of all photos to tag
    photos: [] // We load 10 images at a time here
};

/**
 * FIXME: Currently this fn is not used  -- need to be added
 *
 * Backend sends first 100 images on /api/v2/photos/web/index
 * need to change it to first 10 and introduce loadMore fn.
 * and executed when the user swipes to their last image on swiper
 */
export const loadMoreWebImages = createAsyncThunk(
    'images/loadMoreWebImages', // This is the action type for the thunk
    async ({ token, photo_id }, { rejectWithValue }) => {
        try {
            const response = await axios({
                url: `${URL}/api/v2/photos/web/load-more`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: { photo_id }
            });

            if (response.data) {
                let photos = response.data.map(photo => {
                    photo.tags = null; // Clear tags if necessary
                    return photo;
                });

                return { photos }; // Automatically dispatches a fulfilled action if successful
            }
        } catch (err) {
            // console.log('load_more_web_images', err.response ? err.response.data : err);
            return rejectWithValue('Failed to load more images'); // Handling errors
        }
    }
);

const webSlice = createSlice({

    name: "web",

    initialState,

    reducers: {

        loadMoreWebImages: (state, action) => {
            action.payload.map(photo => {
                state.photos.push(photo);
                state.count++;
            });
        }
    },

    extraReducers: (builder) => {

    }
});

export const { } = webSlice.actions;
export default webSlice.reducer;
