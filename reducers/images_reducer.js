import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Sentry from '@sentry/react-native';

const initialState = {
    imagesArray: [],
    isSelecting: false,
    selected: 0,
    selectedImages: [],
    previousTags: []
};

/**
 * API Requests
 * - deleteWebImage
 * - getUntaggedImages
 * - uploadImage
 * - uploadTagsToWebImage
 */

export const deleteWebImage = createAsyncThunk(
    'images/deleteWebImage',
    async ({ token, photoId, enableAdminTagging }, { rejectWithValue }) => {
        try {
            const response = await axios({
                url: `${URL}/api/photos/delete`,
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: { photoId }
            });

            console.log('deleteWebImgResp', response.data);

            if (response.data.success) {
                console.log('deleteWebImageSuccess', response.data);
                console.log({enableAdminTagging});

                return photoId;  // returning photoId to identify the deleted image
            } else {
                return rejectWithValue('Failed to delete image, no success flag');
            }
        } catch (error) {
            console.error('delete web image.error', error);
            return rejectWithValue(error.response?.data || 'An error occurred during deletion');
        }
    }
);

export const getUntaggedImages = createAsyncThunk(
    'images/getUntaggedImages',
    async (token, { rejectWithValue }) => {
        try
        {
            const response = await axios({
                url: `${URL}/api/v2/photos/get-untagged-uploads`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Return the photos array if available
            if (response && response.data && response.data.photos.length > 0)
            {
                return {
                    images: response.data.photos,
                    type: 'WEB'
                };
            }
            else
            {
                // Handle no photos case
                return rejectWithValue('No photos found');
            }
        }
        catch (error)
        {
            console.error('getUntaggedImages error:', error.response || error.message);

            // Return a reject action with value if an error occurs
            return rejectWithValue(error.response?.data || 'Network Error');
        }
    }
);


export const uploadImage = createAsyncThunk(
    'images/uploadImage',
    async ({ token, imageData, imageId, enableAdminTagging, isTagged }, { rejectWithValue }) => {
        try
        {
            const response = await axios({
                url: URL + '/api/photos/upload/with-or-without-tags',
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                data: imageData
            });

            if (response.data?.success) {
                return {
                    imageId,
                    photo_id: response.data.photo_id,
                    enableAdminTagging,
                    isTagged
                };
            } else {
                return rejectWithValue('Upload failed with no success flag');
            }
        }
        catch (error)
        {
            console.error('uploadImage.catch', error);

            let errorMessage = 'none';

            if (error.response)
            {
                switch (error.response.data?.msg)
                {
                    case 'photo-already-uploaded':
                        errorMessage = 'photo-already-uploaded';
                        break;
                    case 'invalid-coordinates':
                        errorMessage = 'invalid-coordinates';
                        break;
                    default:
                        errorMessage = error.response.data?.msg || 'unknown';
                }

                Sentry.captureException(new Error(JSON.stringify(error.response.data)), {
                    level: 'error',
                    tags: {
                        section: 'image_upload',
                        errorMessage
                    }
                });
            }

            return rejectWithValue(errorMessage);
        }
    }
);


export const uploadTagsToWebImage = createAsyncThunk(
    'images/uploadTagsToWebImage',
    async ({ token, image }, { rejectWithValue }) => {
        try {
            const response = await axios({
                url: `${URL}/api/v2/add-tags-to-uploaded-image`,
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    photo_id: image.id,
                    tags: image.tags,
                    custom_tags: image.customTags,
                    picked_up: image.picked_up ? 1 : 0
                }
            });

            if (response.data.success) {
                return { imageId: image.id };
            } else {
                return rejectWithValue('Failed to add tags to the image');
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || 'An error occurred during the upload');
        }
    }
);


const imagesSlice = createSlice({

    name: 'images',

    initialState,

    reducers: {

        addImages (state, action) {

        },

        /**
         * Add or update tags object on a gallery image
         *
         * payload = {tag, currentIndex, quantityChanged}
         * quantityChanged = true if quantity is changed from picker wheel
         *
         * check if tag `category` already exist on image index
         * if false --> add tag to image
         * if true --> check if title is already present
         * title if false --> add tag title to the category with quantity: 1
         * title is true (already present) -->
         * if quantityChanged change the quantity to that number
         * else add 1 to quantity
         *
         * after adding tag save tag to previousTags array.
         * max 10 tags in previousTags array remove old tags if it exceeds limits.
         */
        addTagToImage (state, action) {
            let image = state.imagesArray[action.payload.currentIndex];
            let newTags = image.tags;

            let quantity = 1;
            // if quantity exists, assign it
            if (action.payload.tag.hasOwnProperty('quantity')) {
                quantity = action.payload.tag.quantity;
            }
            let payloadCategory = action.payload.tag.category;
            let payloadTitle = action.payload.tag.title;
            let quantityChanged = action.payload.quantityChanged
                ? action.payload.quantityChanged
                : false;

            // check if category of incoming payload already exist in image tags
            if (newTags.hasOwnProperty(payloadCategory)) {
                // check if title of incoming payload already exist
                if (newTags[payloadCategory].hasOwnProperty(payloadTitle)) {
                    quantity = newTags[payloadCategory][payloadTitle];

                    // if quantity is changed from picker wheel assign it
                    // else increase quantity by 1
                    quantity = quantityChanged
                        ? action.payload.tag.quantity
                        : quantity + 1;
                }
                image.tags[payloadCategory][payloadTitle] = quantity;
            } else {
                // if incoming payload category doesn't exist on image tags add it
                image.tags[payloadCategory] = {
                    [payloadTitle]: quantity
                };
            }

            // check if tag already exist in prev tags array
            const prevImgIndex = state.previousTags.findIndex(
                tag => tag.key === payloadTitle
            );

            // if tag doesn't exist add tag to array
            // if length < 10 then add at the start of array
            // else remove the last element and add new tag to the start of array

            // if item in array remove it and add to the start of array

            if (prevImgIndex === -1) {
                if (state.previousTags.length < 10) {
                    state.previousTags.unshift({
                        category: payloadCategory,
                        key: payloadTitle
                    });
                } else {
                    state.previousTags.pop();
                    state.previousTags.unshift({
                        category: payloadCategory,
                        key: payloadTitle
                    });
                }
            } else {
                state.previousTags.splice(prevImgIndex, 1);
                state.previousTags.unshift({
                    category: payloadCategory,
                    key: payloadTitle
                });
            }
        },

        addCustomTagToImage (state, action) {
            let currentImage =
                state.imagesArray[action.payload.currentIndex];
            let customTags = action.payload.tag;

            if (currentImage.customTags) {
                currentImage.customTags.push(customTags);
            } else {
                currentImage.customTags = [customTags];
            }

            // check if tag already exist in prev tags array
            const prevImgIndex = state.previousTags.findIndex(
                tag => tag.key === action.payload.tag
            );

            // if tag doesn't exist add tag to array
            // if length < 10 then add at the start of array
            // else remove the last element and add new tag to the start of array

            // if item in array remove it and add to the start of array

            if (prevImgIndex === -1) {
                if (state.previousTags.length < 10) {
                    state.previousTags.unshift({
                        category: 'custom-tag',
                        key: action.payload.tag
                    });
                } else {
                    state.previousTags.pop();
                    state.previousTags.unshift({
                        category: 'custom-tag',
                        key: action.payload.tag
                    });
                }
            } else {
                state.previousTags.splice(prevImgIndex, 1);
                state.previousTags.unshift({
                    category: 'custom-tag',
                    key: action.payload.tag
                });
            }
        },

        /**
         * Changes litter picked up status of all images
         * to payload
         *
         * action.payload -- {boolean}
         */
        changeLitterStatus (state, action) {
            state.imagesArray.map(img => (img.picked_up = action.payload));
        },

        /**
         * After setting enable_admin_tagging changes to False,
         *
         * We want to clear the users uploaded un-tagged images.
         */
        clearUploadedWebImages (state) {
            state.imagesArray = state.imagesArray.filter(img => {
                return img.type === 'WEB' && img.hasOwnProperty('photoId');
            });
        },

        /**
         * Decrement the count of images selected for deletion
         */
        decrementSelected (state) {
            state.selected = state.selected - 1;
        },

        // /**
        //  * Delete image by id
        //  */
        // deleteImage (state, action) {
        //     const index = state.imagesArray.findIndex(
        //         delImg => delImg.id === action.payload
        //     );
        //
        //     if (index !== -1) {
        //         state.imagesArray.splice(index, 1);
        //     }
        // },

        /**
         * Delete selected images -- all images with property selected set to true
         */
        deleteSelectedImages (state, action) {
            state.imagesArray = state.imagesArray.filter(
                img => !img.selected
            );

            state.selected = 0;
        },

        /**
         * When isSelecting is turned off,
         *
         * Change selected value on every image to false
         */
        deselectAllImages (state, action) {
            state.imagesArray.map(image => {
                image.selected = false;
            });
        },

        /**
         * Increment the count of images selected for deletion
         */
        incrementSelected (state, action) {
            state.selected = state.selected + 1;
        },

        /**
         * remove the tag from image based on index
         */
        removeTagFromImage (state, action) {

            let photo = state.imagesArray[action.payload.currentIndex];

            // if only one tag in payload category delete the category also
            // else delete only tag
            if (Object.keys(photo.tags[action.payload.category]).length === 1) {
                delete photo.tags[action.payload.category];
            } else {
                delete photo.tags[action.payload.category][
                    action.payload.tag
                ];
            }
        },

        removeCustomTagFromImage (state, action) {
            state.imagesArray[
                action.payload.currentIndex
            ].customTags.splice(action.payload.tagIndex, 1);
        },

        /**
         * toggles picked_up status on an image based on id
         */
        togglePickedUp (state, action) {
            const imageIndex = state.imagesArray.findIndex(
                image => image.id === action.payload
            );

            if (imageIndex !== -1) {
                state.imagesArray[imageIndex].picked_up =
                    !state.imagesArray[imageIndex].picked_up;
            }
        },

        /**
         * Toggles isSelecting -- selecting images for deletion
         */
        toggleSelecting (state) {
            state.selected = 0;
            state.isSelecting = !state.isSelecting;
        },

        /**
         * toggle selected property of a image object
         */
        toggleSelectedImages (state, action) {
            state.imagesArray[action.payload].selected = !state.imagesArray[action.payload].selected;
        },

        /**
         * After an untagged image was uploaded,
         *
         * If user.enable_admin_tagging is false,
         * Update the image as uploaded which will show a cloud emoji
         */
        updateImageAsUploaded (state, action) {

        }
    },

    extraReducers: (builder) => {

        builder

            .addCase(deleteWebImage.pending, (state) => {
                // nothing yet
            })
            .addCase(deleteWebImage.fulfilled, (state, action) => {
                // no loading yet

                const index = state.imagesArray.findIndex(
                    delImg => delImg.id === action.payload
                );

                if (index !== -1) {
                    state.imagesArray.splice(index, 1);
                }
            })
            .addCase(deleteWebImage.rejected, (state, action) => {
                // no error handling yet
            })

            /**
             * Add images to state
             *
             * Three type of images --
             * Platform: mobile
             * type: "gallery" or "camera"
             * "CAMERA" --> Image taken from OLM App camera (currently disabled)
             * "GALLERY" --> Selected from phone gallery
             *
             * Platform: web
             * type: "web"
             * "WEB" --> Uploaded from web app. May or may not be tagged
             *
             * CAMERA & GALLERY image have same shape object
             *
             * if WEB --> check if image with same photoId already exist in state
             * if not add it to images array
             *
             * WEB images dont display lat/long properties at the moment
             * but they are geotagged because web app only accepts geotagged images.
             */
            .addCase(getUntaggedImages.fulfilled, (state, action) => {

                action.payload.images && action.payload.images.map(image => {
                    let index;

                    if (image.platform === 'mobile') {
                        // image type can be gallery or camera

                        if (image.uploaded) {
                            index = state.imagesArray.findIndex(
                                img => img.id === image.id
                            );
                        } else {
                            index = state.imagesArray.findIndex(
                                img => img.uri === image.uri
                            );
                        }
                    }

                    // size, height, width?

                    // If index is -1, it was not found
                    if (index === -1) {
                        state.imagesArray.push({
                            id: image.id,
                            date: image.date ?? null,
                            lat: image.lat ?? 0,
                            lon: image.lon ?? 0,
                            filename: image.filename,
                            uri: image.uri,
                            type: image.type, // gallery, camera, or web
                            platform: image.platform, // web or mobile

                            tags: image.tags,
                            customTags: image.customTags,
                            picked_up: action.payload.picked_up,

                            // photoId: image.id, // need to remove this duplicate
                            selected: false,
                            uploaded: image.uploaded
                        });
                    }
                });
            })

            // Upload Image
            .addCase(uploadImage.pending, (state) => {
                // state.uploading = true;
            })
            .addCase(uploadImage.fulfilled, (state, action) => {
                // state.uploading = false;

                const {
                    imageId,
                    photo_id,
                    enableAdminTagging,
                    isTagged
                } = action.payload;

                if (enableAdminTagging || isTagged) {

                    // can we filter this instead?
                    const index = state.imagesArray.findIndex(
                        delImg => delImg.id === action.payload
                    );

                    if (index !== -1) {
                        state.imagesArray.splice(index, 1);
                    }

                } else {
                    // Update image as uploaded
                    state.imagesArray = state.imagesArray.map(img => {

                        if (img.type === 'gallery' && img.id === imageId) {
                            img.id = action.payload.photo_id;
                            img.type = 'web';
                        }

                        img.uploaded = true;

                        return img;
                    });
                }
            })
            .addCase(uploadImage.rejected, (state, action) => {
                state.uploading = false;
                state.error = action.payload;
            })

            // UploadTagsToWebImage
            .addCase(uploadTagsToWebImage.pending, (state) => {
                // nothing yet
            })
            .addCase(uploadTagsToWebImage.fulfilled, (state, action) => {
                // Assuming images are stored in an array and you need to update or remove one
                const index = state.imagesArray.findIndex(
                    delImg => delImg.id === action.payload
                );

                if (index !== -1) {
                    state.imagesArray.splice(index, 1);
                }
            })
            .addCase(uploadTagsToWebImage.rejected, (state, action) => {
                // state.loading = false;
                // state.error = action.payload;
            });
    }
});

export const {
    addImages,
    addTagToImage,
    addCustomTagToImage,
    changeLitterStatus,
    clearUploadedWebImages,
    decrementSelected,
    deleteImage,
    deleteSelectedImages,
    deselectAllImages,
    incrementSelected,
    removeTagFromImage,
    removeCustomTagFromImage,
    togglePickedUp,
    toggleSelecting,
    toggleSelectedImages,
    updateImageAsUploaded
} = imagesSlice.actions;

export default imagesSlice.reducer;


