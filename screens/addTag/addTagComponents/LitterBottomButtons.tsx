import React from 'react';
import { useDispatch } from "react-redux";
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors, SubTitle } from '../../components';
import { addTagToImage, togglePickedUp } from "../../../reducers/images_reducer";
import { changeQuantityStatus } from "../../../reducers/litter_reducer";

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface LitterBottomButtonsProps {
    images: Array<{picked_up?: boolean; id?: string}>;
    swiperIndex: number;
    lang: string;
    category: {title: string};
    item: string;
    q: number;
    quantityChanged?: boolean;

    // functions
    addTagToImage?: (payload: {
        tag: {category: string; title: string; quantity: number};
        currentIndex: number;
        quantityChanged?: boolean;
    }) => void;

    deleteButtonPressed: () => void;
}

const LitterBottomButtons: React.FC<LitterBottomButtonsProps> = ({
    images,
    swiperIndex,
    category,
    item,
    q,
    quantityChanged,
}) => {

    const dispatch = useDispatch();

    /**
     * Add tag on a specific image
     */
    const addTag = () => {
        const tag = {
            category: category.title.toString(),
            title: item.toString(),
            quantity: q
        };

        dispatch(addTagToImage({
            tag,
            currentIndex: swiperIndex,
            quantityChanged: quantityChanged ?? false
        }));

        /**
         * If quantityChanged is true -- then while clicking Add Tag button
         * the quantity value currently in PICKER is added to tag
         *
         * else if quantityChanged is false -- then while clicking Add Tag button
         * quantity currently on TAG + 1 is added on tag.
         *
         * here we are changing status to false once Add tag button is pressed
         */
        // @ts-ignore
        dispatch(changeQuantityStatus(false));
    }

    /**
     * Toggle the picked-up status of 1 image in our array
     */
    const handleTogglePickedUp = (): void => {
        dispatch(togglePickedUp(images[swiperIndex]?.id));
    };

    return (
        // @ts-ignore
        <View style={styles.pb5}>
            <ScrollView
                bounces={false}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            >
                <TouchableOpacity
                    onPress={() => handleTogglePickedUp()}
                    style={styles.pickedUpButton}
                >
                    {images[swiperIndex]?.picked_up ? (
                        <SubTitle
                            color="white"
                            dictionary={`tag.picked-thumb`}
                        />
                    ) : (
                        <SubTitle
                            color="white"
                            dictionary={`tag.not-picked-thumb`}
                        />
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => addTag()}
                    style={styles.buttonStyle}
                >
                    <SubTitle
                        color="white"
                        dictionary={`tag.add-tag`}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    // onPress={this.props.deleteButtonPressed}
                    style={styles.buttonStyle}
                >
                    <SubTitle
                        color="white"
                        dictionary={`tag.delete-image`}
                    />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    pickedUpButton: {
        height: SCREEN_HEIGHT * 0.05,
        backgroundColor: Colors.accent,
        marginHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        paddingLeft: 10,
        paddingRight: 10
    },
    buttonStyle: {
        height: SCREEN_HEIGHT * 0.05,
        backgroundColor: Colors.accent,
        marginHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        paddingLeft: 10,
        paddingRight: 10
    },
    pb5: {
        paddingBottom: 5
    }
});

export default LitterBottomButtons;
