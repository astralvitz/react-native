import React, { useRef } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import { useDispatch } from 'react-redux';
import { Body, Caption, Colors } from '../../components';
import { removeCustomTagFromImage, removeTagFromImage } from "../../../reducers/images_reducer";

const SCREEN_WIDTH = Dimensions.get('window').width;

// interface LitterTagsProps {
//     tags?: {[category: string]: {[tag: string]: any}};
//     customTags?: string[];
//     lang: string;
//     swiperIndex: number;
//     removeTagFromImage: (params: {
//         category: string;
//         tag: string;
//         currentIndex: number;
//     }) => void;
//     removeCustomTagFromImage: (params: {
//         tagIndex: number;
//         currentIndex: number;
//     }) => void;
//     item?: any;
//     items?: any[];
// }

// Tags not being deleted when using PureComponent
const LitterTags = ({ tags, customTags, swiperIndex }) => {

    const dispatch = useDispatch();
    const scrollRef = useRef(null);

    /**
     * Display a card for each tag
     */
    const renderTags = () => {
        if (tags) {
            return Object.keys(tags).map(category => {
                if (tags[category]) {
                    return Object.keys(tags[category]).map(tag => {
                        const value = tags[category][tag];

                        return (
                            <Pressable
                                key={tag}
                                onPress={() => removeTag(category, tag)}
                                onLayout={event => scrollTo(event)}
                            >
                                <View style={styles.card}>
                                    <Caption dictionary={`litter.categories.${category}`} />

                                    <View style={{ flexDirection: 'row' }}>
                                        <Body dictionary={`litter.${category}.${tag}`} />

                                        <Body>&nbsp; ({value})</Body>
                                    </View>
                                </View>
                            </Pressable>
                        );
                    });
                }
            });
        }
    }

    /**
     * Remove a tag from a category,
     *
     * From a specific image.
     */
    const removeTag = (category, tag) => {
        const currentIndex = swiperIndex;

        dispatch(removeTagFromImage({
            category,
            tag,
            currentIndex
        }));
    }

    /**
     * fn to render custom tags
     * Array<string> customTags is present in image object
     */
    const renderCustomTags = () => {
        if (customTags) {
            return customTags.map((customTag, index) => {
                return (
                    <Pressable
                        key={customTag}
                        onPress={(event) => {
                            dispatch(removeCustomTagFromImage({
                                tagIndex: index,
                                currentIndex: swiperIndex
                            }))
                        }}
                        onLayout={event => scrollTo(event)}
                    >
                        <View style={styles.card}>
                            <Caption>Custom Tag</Caption>

                            <Body>{customTag}</Body>
                        </View>
                    </Pressable>
                );
            });
        }
    }

    /**
     * fn to scroll scrollview to location of the new tag
     */
    const scrollTo = (event) => {
        const layout = event.nativeEvent.layout;

        scrollRef.current?.scrollTo({
            x: layout.x,
            y: layout.y,
            animated: true
        });
    }

    /**
     * Loop over each category, and loop over each item in each category
     */
    return (
        <View style={{ width: SCREEN_WIDTH }}>
            <ScrollView
                contentContainerStyle={{ paddingLeft: 20, marginBottom: 10 }}
                ref={scrollRef}
                bounces={false}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            >
                {renderCustomTags()}
                {renderTags()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderWidth: 1,
        padding: 10,
        marginRight: 5,
        borderRadius: 12,
        borderColor: Colors.muted,
        marginBottom: -5
    }
});

export default LitterTags;
