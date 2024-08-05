import React, { } from 'react';
import { Dimensions, FlatList, Image, Pressable, Text, View } from 'react-native';
import { useDispatch } from "react-redux";
import { Body, SubTitle } from '../../components';
import { isTagged } from '../../../utils/isTagged';
import { decrementSelected, incrementSelected, toggleSelectedImages } from "../../../reducers/images_reducer";
import { changeSwiperIndex } from "../../../reducers/litter_reducer";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const UploadImagesGrid = ({ images, isSelecting, navigation, uniqueValue }) => {

    const dispatch = useDispatch();

    const imagePressed = (index) => {
        const image = images[index];

        if (isSelecting)
        {
            image.selected
                ? dispatch(decrementSelected())
                : dispatch(incrementSelected())

            dispatch(toggleSelectedImages(index));
        }
        else
        {
            // shared_reducer - Open LitterPicker modal

            // litter.js
            dispatch(changeSwiperIndex(index));

            navigation.navigate('ADD_TAGS');
        }
    }

    /**
     * Render images for uploading & tagging
     *
     * - Show each image in the grid
     * - Show icons for each image
     *   - isTagged
     *   - isPickedUp
     *   - isSelected: for deletion
     */
    const renderImage = ({ item, index }) => {
        const isItemTagged = isTagged(item);
        const itemIsPickedUp = item.picked_up ?? null;
        const pickedUpIcon = itemIsPickedUp ? '⬆️' : '⬇️';
        const isItemUploaded = item.hasOwnProperty('uploaded') && item.uploaded;

        return (
            <Pressable onPress={() => imagePressed(index)}>
                <View style={styles.gridImageContainer}>
                    <Image
                        style={styles.gridImageStyle}
                        source={{
                            uri: item.hasOwnProperty('uri') && item.uri !== undefined
                                ? item.uri
                                : item.filename
                        }}
                        resizeMode="cover"
                    />
                    {isItemUploaded && (
                        <View style={{ position: 'absolute', top: 5, left: 5 }}>
                            <Text>☁</Text>
                        </View>
                    )}
                    {item.selected && (
                        <View style={styles.checkCircleContainer}>
                            <Text>🚮</Text>
                        </View>
                    )}
                    {isItemTagged && (
                        <View
                            style={{
                                position: 'absolute',
                                right: 30,
                                top: 6
                            }}>
                            <Text>🏷</Text>
                        </View>
                    )}
                    {itemIsPickedUp !== null && (
                        <View
                            style={{
                                position: 'absolute',
                                top: 5,
                                right: 5
                            }}>
                            <Text>{pickedUpIcon}</Text>
                        </View>
                    )}
                </View>
            </Pressable>
        );
    };

    // Show empty state illustration when no images
    if (images.length === 0)
    {
        return (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 0.75 }}>
                <Image
                    style={styles.imageStyle}
                    source={require('../../../assets/illustrations/empty_image.png')}
                />
                <SubTitle
                    style={styles.exptyStateText}
                    dictionary={'leftpage.no-images'}
                />
                <Body
                    style={styles.exptyStateText}
                    dictionary={'leftpage.take-photo'}
                />
            </View>
        );
    }

    return (
        <View style={{ paddingTop: 1, paddingHorizontal: 0.5 }}>
            {
                images && (
                    <FlatList
                        contentContainerStyle={{ paddingBottom: 100 }}
                        data={images}
                        extraData={uniqueValue}
                        keyExtractor={(item, index) => item + index}
                        numColumns={3}
                        renderItem={renderImage}
                        keyboardShouldPersistTaps="handled"
                    />
                )
            }
        </View>
    );
}

const styles = {
    exptyStateText: {
        textAlign: 'center',
        marginTop: 20,
        paddingHorizontal: 20
    },
    imageStyle: {
        width: SCREEN_WIDTH / 2,
        height: SCREEN_WIDTH / 2
    },
    gridImageContainer: {
        width: SCREEN_WIDTH / 3 - 2,
        height: SCREEN_WIDTH / 3 - 2,
        marginHorizontal: 0.5,
        marginTop: 1
    },
    gridImageStyle: {
        width: SCREEN_WIDTH / 3 - 2,
        height: SCREEN_WIDTH / 3 - 2
    },
    checkCircleContainer: {
        position: 'absolute',
        width: 24,
        height: 24,
        right: 10,
        bottom: 10,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center'
    }
};

export default UploadImagesGrid;
