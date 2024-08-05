import { createSlice } from "@reduxjs/toolkit";
import { useTranslation } from 'react-i18next';

import CATEGORIES from '../assets/data/categories';
import LITTERKEYS from '../assets/data/litterkeys';

const initialState = {
    category: CATEGORIES[0],
    items: LITTERKEYS.smoking,
    item: 'butts',
    q: 1,
    collectionLength: 0,
    displayAllTags: false,
    hasLitter: false,
    index: null,
    indexSelected: null, // index of camera_photos, gallery or web
    // photoSelected: null,
    photoType: '', // gallery, camera, or web.
    presence: true,
    positions: {}, // coordinates of each tag for animation
    suggestedTags: [],
    swiperIndex: 0, // the index of all camera, web, gallery photos
    tags: {},
    tagsModalVisible: false,
    totalImagesToUpload: 0,
    totalLitterCount: 0,
    quantityChanged: false
};

const litterSlice = createSlice({

    name: 'litter',

    initialState,

    reducers: {
        /**
         * Change category
         *
         * @category = Object => title: 'smoking", 'path: '../filepath.png'
         * @items = Array of objects [ { id, key }, { id, key } ]
         * @item = First key from array 'butts'
         */
        changeCategory (state, action)
        {
            const category = CATEGORIES.find(cat => cat.title === action.payload);
            const items = LITTERKEYS[category.title];
            const item = items[0];

            state.category = category;
            state.items = items;
            state.item = item;
            state.q = 1;
        },

        /**
         * Change item key within a category
         *
         * @return 'butts', 'facemask', etc.
         */
        changeItem(state, action) {
            state.item = action.payload;
            state.q = 1;
        },

        /**
         * Change quantity
         *
         * set quantityChanged to true so that next time Add Tag
         * is pressed before changing tag quantity in increased by 1;
         */
        changeQ(state, action) {
            state.q = action.payload;
            state.quantityChanged = true;
        },

        /**
         * Change Status of quantity change
         * picker wheel rotated status == True
         * after tag is added status set to false
         */
        changeQuantityStatus (state, action) {
            state.quantityChanged = action.payload;
        },

        /**
         * Change the index of the Swiper on LitterPicker.Swiper.LitterImage
         */
        changeSwiperIndex (state, action) {
            state.swiperIndex = action.payload;
        },

        // Reset tags to null and close LitterPicker modal
        resetLitterState () {
            return initialState;
        },

        /**
         * Content to show in the modal on LitterPicker
         */
        showAllTags(state, action) {
            state.displayAllTags = action.payload;
        },

        /**
         * Show the modal on LitterPicker.js
         * Need to set the content separately
         */
        showInnerModal(state) {
            state.tagsModalVisible = !state.tagsModalVisible;
        },

        /**
         * Filter all translated tag values
         *
         * Return all results
         *
         * Note: We are passing auth.lang as a prop which could be access from auth_reducer
         */
        suggestTags(state, action) {

            let suggestedTagsArray = [];

            Object.entries(LITTERKEYS).some(tags => {
                tags[1].some(tag => {
                    const translatedText = useTranslation(
                        `${action.payload.lang}.litter.${tags[0]}.${tag}`
                    );
                    if (translatedText !== 'Error Translation' && translatedText.toLowerCase().includes(action.payload.text.toLowerCase())) {
                        suggestedTagsArray.push({ category: tags[0], key: tag });
                    }
                });
            });

            state.suggestedTags = suggestedTagsArray;
        },

        /**
         * This will toggle the value for the Switch, not the value for each individual image.
         */
        // INFO: This is not used currently
        // TODO: will need to change presence on particular image
        toggleSwitch(state) {
            state.presence = !state.presence;
        },

        /**
         * Update X-position of tags
         */
        // TODO: Test this -- not sure if it works
        // payload.item is not passed from -litterTags
        updateTagsXPos(state, action) {
            const positions = {...state.positions};
            positions[action.payload.item] = action.payload.x;
            state.positions = positions;
        }
    }
});

export const {
    changeCategory,
    changeItem,
    changeQ,
    changeQuantityStatus,
    changeSwiperIndex,
    resetLitterState,
    showAllTags,
    showInnerModal,
    suggestTags,
    toggleSwitch,
    updateTagsXPos
} = litterSlice.actions;

export default litterSlice.reducer;
