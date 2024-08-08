// import axios from "axios";
// import * as Sentry from "@sentry/react-native";
// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import { URL } from '../actions/types';
//
// const initialState = {
//     uploaded: 0,
//     uploadedFailed: 0,
//     tagged: 0,
//     taggedFailed: 0,
//
//     errorMessage: '',
//     failureCounts: {
//         alreadyUploaded: 0,
//         invalidCoordinates: 0,
//         unknown: 0
//     }
// };
//
// export const uploadImage = createAsyncThunk(
//     'upload/uploadImage',
//     async ({ token, imageData, imageId, enableAdminTagging, isTagged }, { rejectWithValue }) => {
//         try {
//             const response = await axios({
//                 method: 'POST',
//                 url: URL + '/api/photos/upload/with-or-without-tags',
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     'Content-Type': 'multipart/form-data'
//                 },
//                 data: imageData
//             });
//
//             return await response.json();
//         }
//         catch (error) {
//             return rejectWithValue(error.response.data);
//         }
//     }
// );
//
// const uploadSlice = createSlice({
//
//     name: 'upload',
//
//     initialState,
//
//     reducers: {

//     },
//
//     extraReducers: (builder) => {
//
//         builder
//
//             .addCase(uploadImageAsync.pending, (state, action) => {
//
//             })
//             .addCase(uploadImageAsync.fulfilled, (state, action) => {
//
//                 state.uploaded += 1;
//
//             })
//             .addCase(uploadImageAsync.rejected, (state, action) => {
//                 // Sentry.captureException(action.payload);
//
//                 if (action === 'photo-already-uploaded') {
//                     state.errorMessage = 'alreadyUploaded';
//                     state.failureCounts.alreadyUploaded += 1;
//
//                 } else if (action === 'invalid-coordinates') {
//                     state.errorMessage = 'invalidCoordinates';
//                     state.failureCounts.invalidCoordinates += 1;
//                 } else if (action === 'unknown') {
//                     state.errorMessage = 'unknown';
//                     state.failureCounts.unknown += 1;
//                 }
//
//             });
//     }
// });
//
// export const { resetUploadState } = uploadSlice.actions;
//
// export default uploadSlice.reducer;
