import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Platform, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { createSelector } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux';
import { setModel } from '../../reducers/settings_reducer';
import { cancelUpload, checkAppVersion, startUploading } from '../../reducers/shared_reducer';
import { deleteImage, deleteWebImage, getUntaggedImages, uploadImage, uploadTagsToWebImage} from '../../reducers/images_reducer';
import { getPhotosFromCameraroll } from "../../reducers/gallery_reducer";

// import {Button} from '@rneui/themed';
import Icon from 'react-native-vector-icons/Ionicons';
import { Body, Colors, Header, Title } from '../components';

import { checkCameraRollPermission } from '../../utils/permissions';
import { isGeotagged } from '../../utils/isGeotagged';

// Components
import { ActionButton , UploadButton, UploadImagesGrid } from './homeComponents';
import DeviceInfo from 'react-native-device-info';
import { isTagged } from '../../utils/isTagged';
import {useTranslation} from "react-i18next";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const HomeScreen = ({ navigation }) => {

    const dispatch = useDispatch();

    const [isUploadCancelled, setIsUploadCancelled] = useState(false);
    const [total, setTotal] = useState(0); // total number of images to upload
    const [uploaded, setUploaded] = useState(0); // total number of tagged images uploaded
    const [uploadFailed, setUploadFailed] = useState(0);
    const [tagged, setTagged] = useState(0);  // total number of images tagged successfully
    const [taggedFailed, setTaggedFailed] = useState(0);
    const [failedCounts, setFailedCounts] = useState({
        alreadyUploaded: 0,
        invalidCoordinates: 0,
        unknown: 0
    });

    const selectSharedState = state => state.shared;
    const selectImagesState = state => state.images;
    const selectAuthState = state => state.auth;
    const selectSettingsState = state => state.settings;

    // Shared state selectors
    const selectAppVersion = createSelector([selectSharedState], shared => shared.appVersion);
    const selectShowModal = createSelector([selectSharedState], shared => shared.showModal);
    const selectShowThankYouMessages = createSelector([selectSharedState], shared => shared.showThankYouMessages);
    const selectUniqueValue = createSelector([selectSharedState], shared => shared.uniqueValue);
    const selectIsUploading = createSelector([selectSharedState], shared => shared.isUploading);

    // Images state selectors
    const selectImages = createSelector([selectImagesState], images => images.imagesArray);
    const selectIsSelecting = createSelector([selectImagesState], images => images.isSelecting);
    const selectSelected = createSelector([selectImagesState], images => images.selected);

    // Auth state selectors
    const selectLang = createSelector([selectAuthState], auth => auth.lang);
    const selectToken = createSelector([selectAuthState], auth => auth.token);
    const selectUser = createSelector([selectAuthState], auth => auth.user);

    // Settings state selectors
    const selectModel = createSelector([selectSettingsState], settings => settings.model);

    const selectAll = createSelector(
        [
            selectAppVersion,
            selectImages,
            selectIsSelecting,
            selectLang,
            selectShowModal,
            selectModel,
            selectSelected,
            selectShowThankYouMessages,
            selectToken,
            selectUser,
            selectUniqueValue,
            selectIsUploading,
        ],
        (
            appVersion,
            images,
            isSelecting,
            lang,
            showModal,
            model,
            selected,
            showThankYouMessages,
            token,
            user,
            uniqueValue,
            isUploading,
        ) => ({
            appVersion,
            images,
            isSelecting,
            lang,
            showModal,
            model,
            selected,
            showThankYouMessages,
            token,
            user,
            uniqueValue,
            isUploading,
        })
    );

    // Use the combined selector in useSelector
    const {
        appVersion,
        images,
        isSelecting,
        lang,
        showModal,
        model,
        selected,
        showThankYouMessages,
        token,
        user,
        uniqueValue,
        isUploading,
    } = useSelector(selectAll);

    useEffect(() => {
        const getModel = () => {
            const model = DeviceInfo.getModel();

            dispatch(setModel(model));
        };

        getModel();

        if (!user?.enable_admin_tagging) {
            dispatch(getUntaggedImages(token));
        }

        if (!__DEV__) {
            checkNewVersion().then(r => console.log('New version', r));
        }

        checkGalleryPermission();
    }, []);

    const { t } = useTranslation();
    const cancelText = t('leftpage.cancel');
    const deleteText = t('leftpage.delete');

    // useEffect(() => {
    //     if (prevAppVersion !== appVersion) {
    //         checkNewVersion().then(r => console.log('New version', r);
    //     }
    // }, [appVersion]);

    const cancelUploadWrapper = () => {
        dispatch(cancelUpload());

        setIsUploadCancelled(true)
    }

    async function checkGalleryPermission () {
        const result = await checkCameraRollPermission();

        if (result === 'granted') {
            getImagesFromCameraRoll();
        } else {
            navigation.navigate('PERMISSION', { screen: 'GALLERY_PERMISSION' });
        }
    }

    async function checkNewVersion () {
        const platform = Platform.OS;
        const version = DeviceInfo.getVersion();

        if (appVersion === null) {
            dispatch(checkAppVersion());
        } else if (appVersion[platform].version !== version) {
            navigation.navigate('UPDATE', { url: appVersion[platform].url });
        }
    }

    /**
     * Check for images on the web app when this page loads
     * INFO: these are images that were uploaded on website
     * but were not tagged and submitted
     */
    // componentDidUpdate(prevProps) {
    //     if (prevProps.appVersion !== appVersion) {
    //         this.checkNewVersion();
    //     }
    // }

    /**
     * Dispatch action that will get the images from the camera roll
     */
    const getImagesFromCameraRoll = ()  => {
        dispatch(getPhotosFromCameraroll());
    }

    /**
     * Navigate to album screen
     */
    const loadGallery = async () => {
        navigation.navigate('ALBUM', { screen: 'GALLERY' });
    };

    /**
     * fn to determine the state of FAB
     */
    const renderActionButton = () => {
        let status = 'NO_IMAGES';
        let fabFunction = loadGallery;

        if (images?.length === 0) {
            status = 'NO_IMAGES';
            fabFunction = loadGallery;
        }

        if (isSelecting) {
            status = 'SELECTING';
            if (selected > 0) {
                status = 'SELECTED';
                fabFunction = deleteImages;
            }
        }

        return <ActionButton status={status} onPress={fabFunction} />;
    }

    /**
     * Render helper text when delete button is clicked
     */
    const renderHelperMessage = () => {
        if (isSelecting && selected === 0) {
            return (
                <View style={styles.helperContainer}>
                    <Icon
                        color={Colors.muted}
                        name="information-circle-outline"
                        size={32}
                    />
                    <Body
                        style={{marginLeft: 10}}
                        color="muted"
                        dictionary={'leftpage.select-to-delete'}
                    />
                </View>
            );
        }
    }

    /**
     * Render Upload Button
     *
     * ... if images exist and at least 1 image has a tag
     */
    const renderUploadButton = () => {
        if (images?.length === 0 || isSelecting) {
            return;
        }

        let hasTags = false;

        images.map(img => {
            let tagged = isTagged(img);

            if (tagged) {
                hasTags = true;
            }
        });

        if (!hasTags) {
            return;
        }

        return <UploadButton lang={lang} onPress={uploadPhotos} />;
    }

    /**
     * Render Delete / Cancel Header Button
     */
    const renderDeleteButton = () => {
        if (isSelecting) {
            return (
                <Text
                    style={styles.normalWhiteText}
                    onPress={toggleSelecting}
                >{cancelText}</Text>
            );
        }

        if (images?.length > 0) {
            return (
                <Text
                    style={styles.normalWhiteText}
                    onPress={toggleSelecting}
                >{deleteText}</Text>
            );
        }

        return null;
    }

    /**
     * Toggle Selecting - header right
     */
    const toggleSelecting = () => {
        // missing?
        // deselectAllImages();
        toggleSelecting();
    }

    /**
     * if image is of type WEB -- hit api to delete uploaded image
     * then delete from state
     *
     * else
     * delete images from state based on id
     */
    const deleteImages = () => {
        images.map(image => {
            if (image.selected) {
                if (image.type === 'web' && image.uploaded) {
                    dispatch(deleteWebImage({
                        token,
                        image_id: image.id,
                        enableAdminTagging: user.enable_admin_tagging
                    }));
                } else {
                    dispatch(deleteImage(image.id));
                }
            }
        });

        // deleteSelectedImages();
        toggleSelecting();
    }

    // reset state after cancel button pressed
    const resetAfterUploadCancelled = () => {
        setTotal(0);
        setUploaded(0);
        setUploadFailed(0);
        setIsUploadCancelled(false);
        setTagged(0);
        setTaggedFailed(0);
        setFailedCounts({
            alreadyUploaded: 0,
            invalidCoordinates: 0,
            unknown: 0
        });
    };

    /**
     * Upload photos, 1 photo per request
     *
     * - status - images being sent across
     * - fix progress bar percentComplete
     * - Consider: Auto-upload any tagged images in the background once the user has pressed Confirm
     */
    const uploadPhotos = async () => {
        // Reset upload count
        setUploaded(0);
        setUploadFailed(0);
        setTagged(0);
        setTaggedFailed(0);
        setFailedCounts({
            alreadyUploaded: 0,
            invalidCoordinates: 0,
            unknown: 0
        });

        // The model of the users device
        // const model = model;

        let imagesCount = images.length;

        setTotal(imagesCount);

        // shared.js
        // showModal = true;
        // isUploading = true;
        dispatch(startUploading());

        if (imagesCount > 0)
        {
            // async loop
            for (const img of images)
            {
                // break loop if cancel button is pressed
                if (isUploadCancelled) {
                    resetAfterUploadCancelled();
                    return;
                }

                const isgeotagged = isGeotagged(img);
                const isItemTagged = isTagged(img);

                // Upload any new image that is tagged or not
                if (img.type === 'gallery' && isgeotagged) {
                    let ImageData = new FormData();

                    ImageData.append('photo', {
                        name: img.filename,
                        type: 'image/jpeg',
                        uri: img.uri
                    });

                    ImageData.append('lat', img.lat);
                    ImageData.append('lon', img.lon);
                    ImageData.append('date', parseInt(img.date));
                    ImageData.append('picked_up', img.picked_up ? 1 : 0);
                    ImageData.append('model', model);

                    // Tags and custom_tags may or may not exist

                    if (isItemTagged) {
                        if (Object.keys(img.tags).length > 0) {
                            ImageData.append('tags', JSON.stringify(img.tags));
                        }

                        if (img.hasOwnProperty('customTags') && img.customTags.length > 0) {
                            ImageData.append('custom_tags', JSON.stringify(img.customTags));
                        }
                    }

                    // Upload image
                    const response = await uploadImage(
                        token,
                        ImageData,
                        img.id,
                        user.enable_admin_tagging,
                        isItemTagged
                    );

                    // if success upload++ else failed++

                    if (response && response.success) {
                        this.setState(previousState => ({
                            uploaded: previousState.uploaded + 1
                        }));
                    } else {
                        let errorMessage = '';

                        if (response.errorMessage === 'photo-already-uploaded') {
                            errorMessage = 'alreadyUploaded';
                        } else if (response.errorMessage === 'invalid-coordinates') {
                            errorMessage = 'invalidCoordinates';
                        } else if (response.errorMessage === 'unknown') {
                            errorMessage = 'unknown';
                        }

                        // this.setState(previousState => {
                        //     const updatedFailedCounts = {
                        //         ...previousState.failedCounts
                        //     };
                        //
                        //     updatedFailedCounts[errorMessage] =
                        //         (updatedFailedCounts[errorMessage] || 0) + 1;
                        //
                        //     return {
                        //         uploadFailed: previousState.uploadFailed + 1,
                        //         failedCounts: updatedFailedCounts
                        //     };
                        // });
                    }
                } else if (img.type.toLowerCase() === 'web' && isItemTagged) {
                    /**
                     * Upload tags for already uploaded image
                     *
                     * Previously these were images uploaded to web,
                     * But now untagged images can also be uploaded from mobile.
                     * These should be re-classified as Uploaded, Not tagged.
                     *
                     * We can also update 'picked_up' value here
                     */
                    const response = await uploadTagsToWebImage(token, img);

                    if (response && response.success) {
                        setTagged(tagged + 1);
                    } else {
                        setTaggedFailed(taggedFailed + 1);
                    }
                }
                // else if (!isgeotagged)
                // {
                //     this.setState(previousState => ({
                //         uploadFailed: previousState.uploadFailed + 1
                //     }));
                // }
            }
        }

        // showThankYouMessagesAfterUpload();
    };

    /**
     *
     */
    const hideThankYouMessages = () => {
        // closeThankYouMessages();
    }

    return (
        <>
            <Header
                leftContent={<Title color="white" dictionary={'leftpage.upload'} />}
                rightContent={renderDeleteButton()}
            />
            <View style={styles.container}>
                {/* INFO: modal thats shown during image upload */}
                <Modal animationType="slide" transparent={true} visible={showModal}>
                    {/* Waiting spinner to show during upload */}
                    {isUploading && (
                        <View style={styles.modal}>
                            <Text style={styles.uploadText}>
                                useTranslation({'leftpage.please-wait-uploading'})
                            </Text>

                            <ActivityIndicator style={{marginBottom: 10}} />

                            <Text style={styles.uploadCount}>
                                {uploaded} / {total}
                            </Text>

                            {/*<Button*/}
                            {/*    onPress={cancelUploadWrapper)}*/}
                            {/*    title="Cancel"*/}
                            {/*/>*/}
                        </View>
                    )}

                    {/* Thank You + Messages */}
                    {showThankYouMessages && (
                        <View style={styles.modal}>
                            <View style={styles.thankYouModalInner}>
                                <Text
                                    style={{
                                        fontSize: SCREEN_HEIGHT * 0.03,
                                        marginBottom: 5
                                    }}
                                >
                                    useTranslation({'leftpage.thank-you'})
                                </Text>

                                {/* Upload success */}
                                {uploaded > 0 && (
                                    <Text
                                        style={{
                                            fontSize: SCREEN_HEIGHT * 0.02,
                                            marginBottom: 5
                                        }}
                                        values={{
                                            count: uploaded
                                        }}
                                    >
                                        useTranslation({'leftpage.you-have-uploaded'})
                                    </Text>
                                )}

                                {/* Tagged success */}
                                {tagged > 0 && (
                                    <Text
                                        style={{
                                            fontSize: SCREEN_HEIGHT * 0.02,
                                            marginBottom: 5
                                        }}
                                        values={{
                                            count: tagged
                                        }}
                                    >
                                        useTranslation({'leftpage.you-have-tagged'})
                                    </Text>
                                )}

                                {uploadFailed > 0 && (
                                    <View>
                                        <Text
                                            style={{
                                                fontSize: SCREEN_HEIGHT * 0.02,
                                                marginBottom: 5
                                            }}>
                                            {uploadFailed} uploads failed
                                        </Text>

                                        {failedCounts.alreadyUploaded > 0 && (
                                            <Text>
                                                {failedCounts.alreadyUploaded}{' '}
                                                already uploaded
                                            </Text>
                                        )}

                                        {failedCounts.invalidCoordinates > 0 && (
                                            <Text>
                                                {failedCounts.invalidCoordinates}{' '}
                                                invalid coordinates (lat=0, lon=0)
                                            </Text>
                                        )}

                                        {failedCounts.unknown > 0 && (
                                            <Text>
                                                {failedCounts.unknown} unknown)
                                            </Text>
                                        )}
                                    </View>
                                )}

                                {taggedFailed > 0 && (
                                    <Text
                                        style={{ fontSize: SCREEN_HEIGHT * 0.02, marginBottom: 5}}
                                    >
                                        {taggedFailed} tags failed
                                    </Text>
                                )}

                                <View style={{flexDirection: 'row'}}>
                                    <TouchableWithoutFeedback
                                        onPress={hideThankYouMessages}>
                                        <View style={styles.thankYouButton}>
                                            <Text style={styles.normalWhiteText}>
                                                useTranslation({'leftpage.close'})
                                            </Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            </View>
                        </View>
                    )}
                </Modal>

                {/* Grid to display images -- 3 columns */}
                <UploadImagesGrid
                    navigation={navigation}
                    images={images}
                    lang={lang}
                    uniqueValue={uniqueValue}
                    isSelecting={isSelecting}
                />

                <View style={styles.bottomContainer}>{renderHelperMessage()}</View>
            </View>

            {renderActionButton()}
            {renderUploadButton()}
        </>
    );
}

const styles = StyleSheet.create({
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 20
    },
    helperContainer: {
        position: 'relative',
        bottom: 30,
        width: SCREEN_WIDTH - 150,
        height: 80,
        flexDirection: 'row',
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        flex: 1,
        backgroundColor: Colors.accentLight
    },
    normalText: {
        fontSize: SCREEN_HEIGHT * 0.02
    },
    normalWhiteText: {
        color: 'white',
        fontSize: SCREEN_HEIGHT * 0.02
    },
    modal: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    uploadedImagesNotTaggedContainer: {
        padding: 5,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        maWidth: SCREEN_WIDTH * 0.8
    },
    photo: {
        height: 100,
        width: SCREEN_WIDTH * 0.325,
        marginRight: 2
    },
    photos: {
        flexDirection: 'row',
        marginLeft: 2,
        width: SCREEN_WIDTH * 0.99
    },
    progress: {
        alignItems: 'flex-end'
    },
    progressTop: {
        color: 'grey',
        fontSize: 7
    },
    progressBottom: {
        fontSize: 7,
        marginBottom: 15
    },
    // Litter Modal
    litterModal: {
        backgroundColor: 'rgba(255,255,255,1)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    thankYouButton: {
        backgroundColor: 'green',
        borderRadius: 3,
        flex: 0.8,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
    },
    thankYouModalInner: {
        backgroundColor: 'rgba(255,255,255,1)',
        borderRadius: 6,
        flex: 0.2,
        justifyContent: 'center',
        alignItems: 'center',
        width: SCREEN_WIDTH * 0.7,
        paddingTop: 10,
        paddingLeft: 10,
        paddingRight: 10
    },
    uploadCount: {
        color: 'white',
        fontSize: SCREEN_HEIGHT * 0.02,
        fontWeight: 'bold',
        marginBottom: 20
    },
    uploadText: {
        color: 'white',
        fontSize: SCREEN_HEIGHT * 0.02,
        fontWeight: 'bold',
        marginBottom: 10
    }
});

export default HomeScreen;
