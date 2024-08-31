import React, { useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Body, Caption, Colors, CustomTextInput } from '../../components';
import { addCustomTagToImage, addTagToImage } from "../../../reducers/images_reducer";
import { suggestTags } from "../../../reducers/litter_reducer";

const SCREEN_HEIGHT = Dimensions.get('window').height;

const LitterTextInput = ({ swiperIndex, lang, suggestedTags, isKeyboardOpen }) => {

    const dispatch = useDispatch();

    const [text, setText] = useState('');
    const [customTagError, setCustomTagError] = useState('');

    const images = useSelector(state => state.images.imagesArray);
    const previousTags = useSelector(state => state.images.previousTags);

    /**
     * A tag has been selected
     */
    const addTag = (tag) => {
        // reset tags error
        setCustomTagError('');

        const newTag = {
            category: tag.category,
            title: tag.key
        };

        // currentGlobalIndex
        const currentIndex = swiperIndex;

        // images_actions
        dispatch(addTagToImage({
            tag: newTag,
            currentIndex,
            quantityChanged: false
        }));

        // clears text filed after one tag is selected
        setText('');
    }

    /**
     * Add custom tag to images
     * only 3 custom tags can be added per image
     */
    const addCustomTag = async (tag) => {

        setCustomTagError('');

        const isCustomTagValid = await validateCustomTag(tag);

        if (isCustomTagValid) {
            // currentGlobalIndex
            const currentIndex = swiperIndex;

            // images_actions
            dispatch(addCustomTagToImage({
                tag,
                currentIndex
            }));

            setText('');
        }
    };

    /**
     * fn to validate custom tags
     *
     * should be between 3-100 characters length
     * should be unique (case insensitive)
     */
    const validateCustomTag = async (inputText) => {

        const customTagsArray = images[swiperIndex]?.customTags;

        let result = false;

        // check min 3 and max 100 characters
        if (inputText.length >= 3 && inputText.length < 100) {
            result = true;
        } else {
            inputText.length < 3 ? setCustomTagError('tag.custom-tags-min') : setCustomTagError('tag.custom-tags-max');

            return false;
        }

        // below checks are only required if customTagsArray is defined
        // on a new image it's undefined till at least one custom tag is added
        if (customTagsArray) {
            // check if tag already exist
            if (await customTagsArray?.some(tag => tag.toLowerCase() === inputText.toLowerCase()))
            {
                setCustomTagError('tag.tag-already-added');

                return false;
            } else {
                result = true;
            }

            // check if only 10 custom tags are added
            if (customTagsArray?.length < 10) {
                result = true;
            } else {
                setCustomTagError('tag.tag-limit-reached');

                return false;
            }
        }

        return result;
    };

    /**
     * Update text
     */
    const updateText = (text) => {

        setText(text);

        dispatch(suggestTags({
            text,
            lang
        }));
    }

    /**
     * Render a suggested tag
     */
    const renderTag = ({ item }) => {
        const isCustomTag = item?.category === 'custom-tag';

        return (
            <Pressable
                style={styles.tag}
                onPress={() => { isCustomTag ? addCustomTag(item.key) : addTag(item);}}
            >
                <Caption dictionary={`litter.categories.${item.category}`} />

                {/* show translated tag only if it's not a custom tag */}
                <Body
                    style={styles.item}
                    dictionary={ !isCustomTag ? `litter.${item.category}.${item.key}` : ''}
                >{item.key}</Body>
            </Pressable>
        );
    };

    const { t } = useTranslation();
    const suggest = t(`tag.type-to-suggest`);

    // @ts-ignore
    return (
        <View>
            <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
                <CustomTextInput
                    autoCorrect={false}
                    style={styles.textFieldStyle}
                    placeholder={suggest}
                    placeholderTextColor={Colors.muted}
                    onChangeText={(text) => updateText(text)}
                    blurOnSubmit={false}
                    clearButtonMode="always"
                    value={text}
                    onSubmitEditing={() => addCustomTag(text)}
                    touched={!!customTagError}
                    error={customTagError}
                />
            </View>

            {isKeyboardOpen && (
                <View style={styles.tagsOuterContainer}>
                    <View style={styles.suggest}>
                        <Caption
                            dictionary={`tag.suggested-tags`}
                            values={{ count: text === '' ? previousTags.length : suggestedTags.length }}
                        />
                    </View>

                    <FlatList
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{paddingHorizontal: 10}}
                        data={ text === '' ? previousTags : suggestedTags }
                        horizontal={true}
                        renderItem={renderTag}
                        keyExtractor={(item, index) => item.key + index}
                        keyboardShouldPersistTaps="handled"
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    textFieldStyle: {
        paddingLeft: 10
    },
    item: {
        fontSize: SCREEN_HEIGHT * 0.02
    },
    suggest: {
        marginBottom: 5,
        marginLeft: 20,
        backgroundColor: 'white',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start'
    },
    tag: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: Colors.muted
    },
    tagsOuterContainer: {
        marginBottom: 0
    }
});

export default LitterTextInput;
