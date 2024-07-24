import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, View } from 'react-native';
import moment from 'moment';
import _ from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import * as actions from '../../actions';
import { Body, Caption, Colors, Header, SubTitle } from '../components';
import { isGeotagged } from '../../utils/isGeotagged';
import { checkCameraRollPermission } from '../../utils/permissions';
import AnimatedImage from './galleryComponents/AnimatedImage';

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

export default function GalleryScreen ({ navigation }) {

    const [selectedImages, setSelectedImages] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);

    const geotaggedImages = useSelector(state => state.gallery.geotaggedImages);
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        checkGalleryPermission();
    }, []);

    useEffect(() => {
        if (geotaggedImages.length) {
            splitIntoRows(geotaggedImages);
        }
    }, [geotaggedImages]);

    const checkGalleryPermission = async () => {

        const result = await checkCameraRollPermission();

        if (result === 'granted' || result === 'limited')
        {
            dispatch(actions.getPhotosFromCameraroll());

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

        dispatch(actions.addImages(sortedArray, 'GALLERY', user.picked_up));

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
                                key={image.uri}
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
                            this.props.navigation.navigate('HOME');
                            // this.props.setImageLoading;
                        }}>
                        <Body color="white" dictionary={'leftpage.cancel'} />
                    </Pressable>
                }
                centerContent={
                    <SubTitle color="white" dictionary={'leftpage.geotagged'} />
                }
                centerContainerStyle={{ flex: 2 }}
                rightContent={
                    <Pressable
                        onPress={handleDoneClick}>
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
                    <View
                        style={{ flexDirection: 'row', marginTop: 4, justifyContent: 'center' }}>
                        <Icon
                            name="information-circle-outline"
                            style={{color: Colors.muted}}
                            size={18}
                        />
                        <Caption>Only geotagged images can be selected</Caption>
                    </View>

                    <SafeAreaView style={{ flexDirection: 'row',  flex: 1 }}>
                        <FlatList
                            contentContainerStyle={{paddingBottom: 40}}
                            style={{flexDirection: 'column'}}
                            alwaysBounceVertical={false}
                            showsVerticalScrollIndicator={false}
                            data={sortedData}
                            renderItem={renderSection}
                            extraData={selectedImages}
                            keyExtractor={item => `${item.title}`}
                            onEndReached={() => dispatch(actions.getPhotosFromCameraroll('LOAD'))}
                            onEndReachedThreshold={0.05}
                        />
                    </SafeAreaView>
                </View>
            ) : (
                <View style={styles.container}>
                    <ActivityIndicator color={Colors.accent} />
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
