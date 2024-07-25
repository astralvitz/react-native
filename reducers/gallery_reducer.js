import { createSlice } from '@reduxjs/toolkit';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
    imagesLoading: false,
    geotaggedImages: [],
    camerarollImageFetched: false,
    lastFetchTime: null,
    isNextPageAvailable: false,
    lastImageCursor: null
};

/**
 * Get Photos from the CameraRoll
 *
 * initial load -- Home Page -- fetch 1000
 *      sets state -- array of geotaggged
 *                 -- camerarollImageFetched - true
 *                 -- lastFetchTime
 *
 * next fetch - Album screen or Home screen
 * if lastFetch !== null fetch images between lastFetch and Date.now()
 *
 * @param {string} - fetchType --> "INITIAL" | "TIME" | "LOAD"
 * "INITIAL" -> first load
 * "TIME" -> images added to cameraroll/phone gallery after initial load
 * "LOAD" -> loads more images on scroll after initial load
 */
export const getPhotosFromCameraroll = createAsyncThunk(
    'gallery/getPhotosFromCameraroll',
    async (fetchType = 'INITIAL', { getState, rejectWithValue }) => {
        const {
            gallery: {
                geotaggedImages,
                camerarollImageFetched,
                lastFetchTime,
                imagesLoading,
                isNextPageAvailable,
                lastImageCursor
            },
            auth: { user }
        } = getState();

        if (imagesLoading) {
            return rejectWithValue('Images are currently loading');
        }

        let camerarollData;

        const timeParams = {
            first: 1000,
            toTime: Math.floor(new Date().getTime()),
            fromTime: lastFetchTime,
            assetType: 'Photos',
            include: ['location', 'filename', 'fileSize', 'imageSize']
        };

        const initialParams = {
            first: 40,
            assetType: 'Photos',
            include: ['location', 'filename', 'fileSize', 'imageSize']
        };

        const loadParams = {
            first: 20,
            after: lastImageCursor,
            assetType: 'Photos',
            include: ['location', 'filename', 'fileSize', 'imageSize']
        };

        try {
            if (fetchType === 'LOAD' && isNextPageAvailable && lastImageCursor !== null) {
                camerarollData = await CameraRoll.getPhotos(loadParams);
            } else if (geotaggedImages?.length === 0 && !camerarollImageFetched && lastFetchTime === null) {
                camerarollData = await CameraRoll.getPhotos(initialParams);
                fetchType = 'INITIAL';
            } else if (lastFetchTime !== null) {
                camerarollData = await CameraRoll.getPhotos(timeParams);
                fetchType = 'TIME';
            }

            if (!camerarollData) {
                return rejectWithValue('No new photos fetched');
            }

            let id = 1;
            let geotagged = [];
            const imagesArray = camerarollData.edges;
            const { has_next_page: hasNextPage, end_cursor: endCursor } = camerarollData.page_info;

            imagesArray.forEach(item => {
                id++;
                if (
                    item.node.location?.longitude &&
                    item.node.location.latitude &&
                    item.node.location.latitude !== 0 &&
                    item.node.location.longitude !== 0
                ) {
                    const image = item.node.image;

                    geotagged.push({
                        id,
                        date: item.node.timestamp,
                        lat: item.node.location.latitude,
                        lon: item.node.location.longitude,
                        filename: image.filename,
                        uri: image.uri,
                        type: 'gallery',
                        platform: 'mobile',
                        tags: {},
                        customTags: [],
                        selected: false,
                        uploaded: false
                    });
                }
            });

            return { geotagged, fetchType, hasNextPage, endCursor };

        } catch (error) {
            console.error('Error fetching photos from camera roll:', error);
            return rejectWithValue(error.message || 'Failed to fetch photos');
        }
    }
);


const gallerySlice = createSlice({

    name: 'gallery',

    initialState,

    reducers: {
        /**
         * The users images have finished loading
         */
        toggleImagesLoading (state, action) {
            state.imagesLoading = action.payload;
        },

        // /**
        //  * add array of geotagged images to state
        // */
        // addGeotaggedImages (state, action) {
        //     state.geotaggedImages = [
        //         ...action.payload.geotagged,
        //         ...state.geotaggedImages
        //     ];
        //     state.camerarollImageFetched = true;
        //     state.lastFetchTime = Math.floor(new Date().getTime());
        //     state.imagesLoading = false;
        //     if (action.payload.fetchType !== 'TIME') {
        //         state.isNextPageAvailable = action.payload.hasNextPage;
        //         state.lastImageCursor = action.payload.endCursor;
        //     }
        // }
    },

    extraReducers: (builder) => {

        builder

            .addCase(getPhotosFromCameraroll.pending, (state) => {
                state.imagesLoading = true;
                state.error = null;
            })

            .addCase(getPhotosFromCameraroll.fulfilled, (state, action) => {
                state.geotaggedImages = [...state.geotaggedImages, ...action.payload.geotagged];
                state.camerarollImageFetched = true;
                state.lastFetchTime = Math.floor(new Date().getTime());
                state.hasNextPage = action.payload.hasNextPage;
                state.endCursor = action.payload.endCursor;

                if (action.payload.fetchType !== 'TIME') {
                    state.isNextPageAvailable = action.payload.hasNextPage;
                    state.lastImageCursor = action.payload.endCursor;
                }

                state.imagesLoading = false;
            })

            .addCase(getPhotosFromCameraroll.rejected, (state, action) => {
                state.imagesLoading = false;
                state.error = action.payload || 'Failed to fetch images';
            });

    }
});

export const { toggleImagesLoading, addGeotaggedImages } = gallerySlice.actions;

export default gallerySlice.reducer;
