import React, { useState, useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Pressable,
    SafeAreaView,
    StyleSheet,
    View
} from 'react-native';
import moment from 'moment';
import _ from 'lodash';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { Body, Caption, Colors, Header, SubTitle } from '../components';
import { isGeotagged } from '../../utils/isGeotagged';
import { checkCameraRollPermission } from '../../utils/permissions';
import AnimatedImage from './galleryComponents/AnimatedImage';
import { getPhotosFromCameraroll } from "../../reducers/gallery_reducer";
import { addImages } from "../../reducers/images_reducer";

/**
 * fn to check if arg date is "today", this "week", this "month"
 * if older than current month but less than a year old then month number
 * if older than current year then which year.
 * @param {number} date - epoch date
 *
 */
export const placeInTime = date => {
    let today = moment().startOf('day');
    let thisWeek = moment().startOf('week');
    let thisMonth = moment().startOf('month');
    let thisYear = moment().startOf('year');
    const momentOfFile = moment(date);

    if (momentOfFile.isSameOrAfter(today)) {
        return 'today';
    } else if (momentOfFile.isSameOrAfter(thisWeek)) {
        return 'week';
    } else if (momentOfFile.isSameOrAfter(thisMonth)) {
        return 'month';
    } else if (momentOfFile.isSameOrAfter(thisYear)) {
        return momentOfFile.month() + 1;
    } else {
        return momentOfFile.year();
    }
};

const GalleryScreen = ({ navigation }) => {

    const dispatch = useDispatch();

    // For selecting images with swipe gesture
    const IMAGE_PER_ROW = 3;
    const { width } = Dimensions.get('window');
    const IMAGE_SIZE = (width / IMAGE_PER_ROW) - 2;
    const IMAGE_MARGIN = 1;
    const ROW_HEIGHT = IMAGE_SIZE + (IMAGE_MARGIN * 2);
    const lastGesturePosition = useRef({ x: 0, y: 0 });
    const flatListRef = useRef();
    const scrollOffset = useRef(0);

    const [selectedImages, setSelectedImages] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);

    const geotaggedImages = useSelector(state => state.gallery.geotaggedImages);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        checkGalleryPermission();
    }, []);

    useEffect(() => {
        if (geotaggedImages.length) {
            splitIntoRows(geotaggedImages);
        }
    }, [geotaggedImages]);

    const onGestureEvent = event => {
        const { x, y } = event.nativeEvent;

        selectItems(x, y);

        lastGesturePosition.current = { x, y };
    };

    const processedImages = useRef(new Set());

    const selectItems = (x, y) => {

        const adjustedY = y + scrollOffset.current;
        const column = Math.floor(x / (IMAGE_SIZE + IMAGE_MARGIN * 2));

        let accumulatedHeight = 0;

        for (let sectionIndex = 0; sectionIndex < sortedData.length; sectionIndex++) {
            const section = sortedData[sectionIndex];
            const rowsInSection = Math.ceil(section.data.length / IMAGE_PER_ROW);
            const sectionHeight = rowsInSection * ROW_HEIGHT;

            if (adjustedY >= accumulatedHeight && adjustedY < accumulatedHeight + sectionHeight) {
                const sectionRelativeY = adjustedY - accumulatedHeight;
                const row = Math.floor(sectionRelativeY / ROW_HEIGHT);
                const index = row * IMAGE_PER_ROW + column;

                if (index >= 0 && index < section.data.length) {
                    const image = section.data[index];
                    if (image && !processedImages.current.has(image.uri)) {
                        processedImages.current.add(image.uri);
                        toggleSelection(image);
                    }
                }

                break;
            }

            accumulatedHeight += sectionHeight;
        }
    };

    const toggleSelection = (image) => {
        const isSelected = selectedImages.some(selected => selected.uri === image.uri);

        if (isSelected) {
            setSelectedImages(selectedImages => selectedImages.filter(selected => selected.uri !== image.uri));
        } else {
            setSelectedImages(selectedImages => [...selectedImages, image]);
        }
    };

    const onHandlerStateChange = ({ nativeEvent }) => {
        if (nativeEvent.state === State.END) {
            processedImages.current.clear();
        }
    };

    const handleScroll = event => {
        scrollOffset.current = event.nativeEvent.contentOffset.y;
    };

    const checkGalleryPermission = async () => {

        const result = await checkCameraRollPermission();

        if (result === 'granted' || result === 'limited')
        {
            dispatch(getPhotosFromCameraroll());

            await splitIntoRows(geotaggedImages);

            setHasPermission(true);

            setLoading(false);
        }
        else
        {
            navigation.navigate('PERMISSION', {
                screen: 'GALLERY_PERMISSION'
            });
        }
    };

    /**
     * Split images array based on date groups which they belong.
     * Date groups are determined by {@link placeInTime}
     * Groups are "today", this "week", this "month",
     * month name (if older than current month but belongs to current year), year
     * @param {Array} images
     */
    const splitIntoRows = async (images) => {

        let temp = {};

        const sortedImages = _.orderBy(images, ['date'], ['asc']);

        sortedImages.map(image => {
            const dateOfImage = image.date * 1000;
            const placeInTimeOfImage = placeInTime(dateOfImage);
            if (!temp[placeInTimeOfImage]) {
                temp[placeInTimeOfImage] = [];
            }
            temp[placeInTimeOfImage].unshift(image);
        });

        let final = [];
        let order = ['today', 'week', 'month'];
        let allTimeTags = Object.keys(temp).map(prop => Number.isInteger(parseInt(prop)) ? parseInt(prop) : prop);
        let allMonths = allTimeTags.filter(prop => Number.isInteger(prop) && prop < 12).sort((a, b) => b - a);
        let allYears = allTimeTags.filter(prop => Number.isInteger(prop) && !allMonths.includes(prop)).sort((a, b) => b - a);

        order = [...order, ...allMonths, ...allYears];

        order.forEach(prop => {
            if (temp[prop]) {
                final.push({ title: prop, data: temp[prop] });
            }
        });

        setSortedData(final);
    };

    /**
     * fn that is called when "done" is pressed
     * sorts the array based on id
     * call action addImages to save selected images to state
     */
    const handleDoneClick = async () => {
        const sortedArray = selectedImages.sort((a, b) => a.id - b.id);

        dispatch(addImages({
            images: sortedArray,
            type: 'GALLERY',
            picked_up: user.picked_up
        }));

        navigation.navigate('HOME');
    };

    /**
     * fn to select and deselect image on tap
     *
     * @param  item - The image object
     */
    const selectImage = (item) => {

        const index = selectedImages.indexOf(item);

        if (index !== -1) {
            setSelectedImages(selectedImages.filter((_, i) => i !== index));
        } else {
            setSelectedImages(prev => [...prev, item]);
        }
    };

    /**
     * fn that returns the sections for flatlist to display
     */
    const renderSection = ({ item }) => {

        let headerTitle = item?.title;

        if (Number.isInteger(headerTitle) && headerTitle < 12) {
            headerTitle = moment(headerTitle.toString(), 'MM').format('MMMM');
        }

        const titleMap = {
            today: 'Today',
            week: 'This Week',
            month: 'This Month'
        };

        headerTitle = titleMap[headerTitle] || headerTitle;

        return (
            <View>
                <View style={styles.headerStyle}>
                    <Body style={{ color: '#aaaaaa' }}>
                        {headerTitle}
                    </Body>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {item.data.map(image => {
                        const selected = selectedImages.includes(image);
                        const isImageGeotagged = isGeotagged(image);

                        return (
                            <AnimatedImage
                                key={image.uri + ":"}
                                onPress={() => isImageGeotagged && selectImage(image)}
                                image={image}
                                isImageGeotagged={isImageGeotagged}
                                selected={selected}
                            />
                        );
                    })}
                </View>
            </View>
        );
    };

    return (
        <>
            <Header
                leftContent={
                    <Pressable
                        onPress={() => {
                            navigation.navigate('HOME');
                            // setImageLoading;
                        }}>
                        <Body
                            color="white"
                            dictionary={'leftpage.cancel'}
                        />
                    </Pressable>
                }
                centerContent={
                    <SubTitle
                        color="white"
                        dictionary={'leftpage.geotagged'}
                    />
                }
                centerContainerStyle={{ flex: 2 }}
                rightContent={
                    <Pressable
                        onPress={handleDoneClick}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                            <Body color="white" dictionary={'leftpage.next'} />
                            <Body color="white">
                                {selectedImages?.length > 0 && ` : ${selectedImages?.length}`}
                            </Body>
                        </View>
                    </Pressable>
                }
            />

            {hasPermission && !loading ? (
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', marginTop: 4, justifyContent: 'center' }}>
                        <Icon
                            name="information-circle-outline"
                            style={{color: Colors.muted}}
                            size={18}
                        />
                        <Caption>Only geotagged images can be selected</Caption>
                    </View>

                    <SafeAreaView style={{ flexDirection: 'row',  flex: 1 }}>
                        <PanGestureHandler
                            onGestureEvent={onGestureEvent}
                            onHandlerStateChange={onHandlerStateChange}
                            simultaneousHandlers={flatListRef}
                        >
                            <FlatList
                                ref={flatListRef}
                                contentContainerStyle={{ paddingBottom: 40 }}
                                style={{ flexDirection: 'column' }}
                                alwaysBounceVertical={false}
                                data={sortedData}
                                showsVerticalScrollIndicator={false}
                                renderItem={renderSection}
                                extraData={selectedImages}
                                keyExtractor={item => `${item.title}`}
                                onEndReached={() => dispatch(getPhotosFromCameraroll('LOAD'))}
                                onEndReachedThreshold={0.05}
                                onScroll={handleScroll}
                                scrollEventThrottle={16}
                            />
                        </PanGestureHandler>
                    </SafeAreaView>
                </View>
            ) : (
                <View style={styles.container}>
                    <ActivityIndicator
                        color={Colors.accent}
                    />
                </View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    headerStyle: {
        marginTop: 16,
        marginBottom: 5,
        paddingLeft: 5
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default GalleryScreen;
