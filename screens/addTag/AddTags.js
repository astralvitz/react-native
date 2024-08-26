import React, {createRef, useEffect, useState} from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import Swiper from 'react-native-swiper';
import { StackActions } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import ActionSheet from 'react-native-actions-sheet';
import CATEGORIES from '../../assets/data/categories';
import {
    LitterBottomButtons,
    LitterCategories,
    LitterImage,
    LitterPickerWheels,
    LitterTags,
    LitterTextInput
} from './addTagComponents';
import { Body, Colors } from '../components';
import Icon from 'react-native-vector-icons/Ionicons';
import { deleteWebImage } from "../../reducers/images_reducer";
import { useDispatch, useSelector } from "react-redux";
import {changeSwiperIndex} from "../../reducers/litter_reducer";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const AnimatedSwiper = Animated.createAnimatedComponent(Swiper);

const AddTags = ({ navigation, lang }) => {

    const dispatch = useDispatch();

    const [categoryAnimation, setCategoryAnimation] = useState(new Animated.Value(100));
    const [sheetAnimation, setSheetAnimation] = useState(new Animated.Value(0));
    const [opacityAnimation, setOpacityAnimation] = useState(new Animated.Value(1));
    const [isCategoriesVisible, setIsCategoriesVisible] = useState(true);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [animation, setAnimation] = useState(new Animated.Value(0));

    const actionSheetRef = createRef();
    const swiper = createRef();

    // positions category and for tagging/bottom container
    const categoryContainerPosition = 300;
    const taggingContainerPosition = 400;

    // get images from global state
    const images = useSelector(state => state.images.imagesArray);
    const swiperIndex = useSelector(state => state.litter.swiperIndex);
    const token = useSelector(state => state.auth.token);
    const category = useSelector(state => state.litter.category);
    const item = useSelector(state => state.litter.item);
    const model = useSelector(state => state.litter.model);
    const q = useSelector(state => state.litter.q);
    const suggestedTags = useSelector(state => state.litter.suggestedTags);
    const items = useSelector(state => state.litter.items);
    const quantityChanged = useSelector(state => state.litter.quantityChanged);

    useEffect(() => {

        const keyboardDidShowSubscription = Keyboard.addListener(
            'keyboardDidShow',
            (e) => {
                setIsKeyboardOpen(true);
                keyboardStartAnimation(e.endCoordinates.height);
            }
        );

        const keyboardDidHideSubscription = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setIsKeyboardOpen(false);
                startAnimation();
            }
        );

        const openModalTransitionSubscription = navigation.addListener('transitionEnd', () => {
            openTaggingContainer();
        });

        return () => {
            keyboardDidShowSubscription.remove();
            keyboardDidHideSubscription.remove();
            openModalTransitionSubscription();
        };

    }, []);

    const keyboardStartAnimation = (keyboardHeight) => {
        // Animate keyboard only for ios
        // TODO: need testing on other android devices

        const sheetPosition = -(keyboardHeight + taggingContainerPosition);

        Platform.OS === 'ios' &&
            Animated.timing(sheetAnimation, {
                toValue: sheetPosition,
                duration: 500,
                useNativeDriver: true,
                easing: Easing.elastic(1)
            }).start();

        Animated.timing(categoryAnimation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.elastic(1)
        }).start();
    };

    /**
     * fn for start animation on add tags floating button click
     * animates categories from top
     * and Tags sheet with search box from bottom
     */
    const startAnimation = () => {
        Animated.timing(categoryAnimation, {
            // extra 50 for height of container
            toValue: categoryContainerPosition + 50,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.elastic(1)
        }).start();

        Animated.timing(sheetAnimation, {
            toValue: -taggingContainerPosition,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.elastic(1)
        }).start();
    };

    /**
     * Fn for close animation
     * happen on backdrop click
     * @param pressType --> "LONG" | "REGULAR"
     * if pressType === LONG hide categories and tag section but dont show Meta details
     */
    const returnAnimation = (pressType = 'REGULAR') => {
        Animated.timing(categoryAnimation, {
            toValue: -categoryContainerPosition,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.elastic(1)
        }).start(() => {
            pressType === 'REGULAR' && setIsCategoriesVisible(true);
        });
        Animated.timing(sheetAnimation, {
            toValue: 100,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.elastic(1)
        }).start();
    };

    /**
     * fn to open tagging containers with animation
     */
    const openTaggingContainer = () => {
        startAnimation();

        setIsCategoriesVisible(true);
    };

    /**
     * function for deleting image
     *
     * currentIndex is current swiper index
     * if WEB image hit api and delete uploaded image and then delete from state
     *  else delete from state by id
     */
    const deleteImage = async () => {
        // length of all images in state
        const length = images.length;
        const currentIndex = swiperIndex;

        const {id, type} = images[currentIndex];

        if (type === 'WEB') {
            const photoId = images[currentIndex].photoId;

            dispatch(deleteWebImage({ token, photoId, id }));
        } else {
            await deleteImage(id);
        }
        // close delete confirmation action sheet
        // if last image is deleted close AddTags modal
        // else hide delete modal
        // swiper index is changed by onIndexChanged fn of Swiper

        if (currentIndex === length - 1)
        {
            actionSheetRef.current?.hide();
            navigation.dispatch(StackActions.popToTop());
        }
        else if (currentIndex < length - 1) {
            actionSheetRef.current?.hide();
        }
    };

    const outerViewClicked = () => {
        if (isKeyboardOpen) {
            handleCloseKeyboard();
        }
    };

    const handleCloseKeyboard = () => {
        setIsKeyboardOpen(false);

        setKeyboardHeight(0);

        startAnimation();

        Keyboard.dismiss();
    };

    /**
     * The user has swiped left or right across an array of all photo types.
     *
     * This function gives us the new index the user has swiped to.
     */
    const handleSwiperIndexChanged = newGlobalIndex => {
        // Without this, we get "cannot update a component from within the function body of another component"
        setTimeout(() => {
            // litter.js swiperIndex
            dispatch(changeSwiperIndex(newGlobalIndex));
        }, 0);
    };

    /**
     * Array of images to swipe through
     *
     * Returns an aray of all photos
     */
    const renderLitterImage = () => {
        return images.map((image, index) => {
            return (
                <LitterImage
                    key={image.id}
                    category={category}
                    lang={lang}
                    photoSelected={image}
                    swiperIndex={swiperIndex}
                    navigation={navigation}
                    // hide all tagging containers
                    onLongPressStart={() => returnAnimation('LONG')}
                    // show all tagging containers
                    onLongPressEnd={() => startAnimation()}
                    // hide tagging containers and show meta containers
                    onImageTap={() => {
                        console.log('image tapped');
                        // if (isCategoriesVisible) {
                        //     this.returnAnimation('REGULAR');
                        // }
                    }}
                />
            );
        });
    };

    /**
     * The Add Tags component
     */
    const categoryAnimatedStyle = {
        transform: [{translateY: categoryAnimation}]
    };

    const sheetAnimatedStyle = {
        transform: [{translateY: sheetAnimation}]
    };

    // Had a bug with this since upgrading react-native from 0.63 -> 0.72
    // swiper was perfect, but now rarely detected
    // removing the style/containerStyle prop seems to have helped a bit.
    // const animatedStyle = {
    //     transform: [{translateY: animation}]
    // };

    const opacityStyle = {
        opacity: opacityAnimation
    };

    return (
        <View style={{flex: 1}}>
            <View style={{flex: 1}}>
                <View style={styles.container}>
                    {/* Hide status bar on this screen */}
                    <StatusBar hidden />

                    {/* Images swiper */}
                    <AnimatedSwiper
                        ref={swiper}
                        showsButtons={!isKeyboardOpen}
                        prevButton={
                            <View style={styles.slideButtonStyle}>
                                <Icon
                                    name="chevron-back"
                                    color={Colors.accent}
                                    size={32}
                                />
                            </View>
                        }
                        nextButton={
                            <View style={styles.slideButtonStyle}>
                                <Icon
                                    name="chevron-forward"
                                    color={Colors.accent}
                                    size={32}
                                />
                            </View>
                        }
                        index={swiperIndex}
                        loop={false}
                        loadMinimal
                        loadMinimalSize={2} // loads only 2 images at a time
                        showsPagination={false}
                        keyboardShouldPersistTaps="handled"
                        onIndexChanged={index => { handleSwiperIndexChanged(index); }}
                    >
                        { renderLitterImage() }
                    </AnimatedSwiper>

                    {/* Top nav */}
                    {/* index/total && Close X */}
                    <View
                        style={{
                            position: 'absolute',
                            top: 20,
                            left: 20,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: SCREEN_WIDTH - 40
                        }}
                    >
                        {/* ImgIndex/Total */}
                        <View style={styles.indexStyle}>
                            <Body color="text">
                                {swiperIndex + 1} / {images.length}
                            </Body>
                        </View>
                        {/* Close X */}
                        <Pressable
                            onPress={() => navigation.navigate('HOME') }
                            style={styles.closeButton}
                        >
                            <Icon
                                name="close-outline"
                                color="black"
                                size={24}
                            />
                        </Pressable>
                    </View>

                    {/* Categories */}
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                top: -categoryContainerPosition,
                                zIndex: 2
                            },
                            categoryAnimatedStyle,
                            opacityStyle
                        ]}
                    >
                        <LitterCategories
                            categories={CATEGORIES}
                            selectedCategory={category}
                            lang={lang}
                        />
                    </Animated.View>

                    {/* Add Tags */}
                    <Animated.View
                        style={[
                            { bottom: -taggingContainerPosition },
                            styles.bottomSheet,
                            sheetAnimatedStyle,
                            opacityStyle
                        ]}
                    >
                        <TouchableWithoutFeedback onPress={outerViewClicked}>
                            <View
                                style={[
                                    { maxWidth: SCREEN_WIDTH },
                                    isKeyboardOpen ? { paddingTop: SCREEN_HEIGHT * 0.15 } : null
                                ]}
                            >
                                <LitterTags
                                    tags={images[swiperIndex]?.tags}
                                    customTags={images[swiperIndex]?.customTags}
                                    lang={lang}
                                    swiperIndex={swiperIndex}
                                />

                                <LitterTextInput
                                    suggestedTags={suggestedTags}
                                    lang={lang}
                                    swiperIndex={swiperIndex}
                                    isKeyboardOpen={isKeyboardOpen}
                                    navigation={navigation}
                                />

                                {!isKeyboardOpen && (
                                    <LitterPickerWheels
                                        item={item}
                                        items={items}
                                        model={model}
                                        category={category}
                                        lang={lang}
                                    />
                                )}

                                {!isKeyboardOpen && (
                                    <LitterBottomButtons
                                        images={images}
                                        swiperIndex={swiperIndex}
                                        lang={lang}
                                        category={category}
                                        item={item}
                                        quantityChanged={quantityChanged}
                                        q={q}
                                        navigation={navigation}
                                        deleteButtonPressed={() => { actionSheetRef.current?.show(); }}
                                    />
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </Animated.View>
                </View>
            </View>

            {/* delete confirmation action sheet */}
            <ActionSheet ref={actionSheetRef}>
                <View style={{ padding: 40, alignItems: 'center'}}>
                    <LottieView
                        source={require('../../assets/lottie/trash_can_lottie.json')}
                        autoPlay
                        loop
                        style={{width: 80, height: 80, marginBottom: 20}}
                    />
                    <Body
                        style={{textAlign: 'center'}}
                        dictionary={`tag.delete-message`}
                    />
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            marginVertical: 40,
                            width: SCREEN_WIDTH - 40
                        }}>
                        <Pressable
                            onPress={actionSheetRef.current?.hide}
                            style={[styles.actionButtonStyle]}
                        >
                            <Body dictionary={`tag.cancel`} />
                        </Pressable>
                        <Pressable
                            onPress={deleteImage}
                            style={[
                                styles.actionButtonStyle,
                                { backgroundColor: Colors.error }
                            ]}
                        >
                            <Body
                                color="white"
                                dictionary={`tag.delete`}
                            />
                        </Pressable>
                    </View>
                </View>
            </ActionSheet>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    statusCard: {
        backgroundColor: Colors.white,
        width: SCREEN_WIDTH - 40,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20
    },
    slideButtonStyle: {
        backgroundColor: '#fff',
        borderRadius: 100,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionButtonStyle: {
        height: 48,
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    overlayStyle: {
        position: 'absolute',
        flex: 1,
        opacity: 0.4,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT
    },
    indexStyle: {
        minWidth: 80,
        paddingHorizontal: 20,
        height: 30,
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center'
    },
    closeButton: {
        width: 30,
        height: 30,
        backgroundColor: 'white',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomSheet: {
        position: 'absolute',
        left: 0,
        paddingVertical: 20,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
    }
});

export default AddTags;
