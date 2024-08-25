import React, { useState, useRef } from 'react';
import { ActivityIndicator, Animated, Dimensions, ImageSourcePropType, Pressable, StyleSheet } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import { GestureHandlerRootView, PinchGestureHandler, State } from 'react-native-gesture-handler';
import { NavigationProp } from '@react-navigation/native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface LitterImageProps {
    photoSelected: {
        uri: string|null;
        filename: string|null;
    };
    navigation: NavigationProp<any>;
    onLongPressStart: () => void;
    onLongPressEnd: () => void;
    category: string;
    item?: string;
    items?: string[];
    q?: number;
    quantityChanged?: boolean;
}

const LitterImage: React.FC<LitterImageProps> = ({
    photoSelected,
    onLongPressStart,
    onLongPressEnd,
    navigation
}) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isLongPress, setIsLongPress] = useState(false);

    const scale = useRef(new Animated.Value(1)).current;
    const focalX = useRef(new Animated.Value(0)).current;
    const focalY = useRef(new Animated.Value(0)).current;

    const onPinchGestureEvent = Animated.event(
        [
            {
                nativeEvent: {
                    scale,
                    focalX,
                    focalY
                }
            }
        ],
        { useNativeDriver: true }
    );

    const _imageLoaded = () => {
        setImageLoaded(true);
    };

    const onPinchHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true
            }).start();
        }
    };

    return (
        <GestureHandlerRootView>
            <GestureRecognizer
                onSwipeDown={state => { navigation.navigate('HOME'); }}
            >
                <PinchGestureHandler
                    onGestureEvent={onPinchGestureEvent}
                    onHandlerStateChange={onPinchHandlerStateChange}>
                    <AnimatedPressable
                        onPress={() => { setIsLongPress(false); }}
                        onLongPress={() => {
                            setIsLongPress(true);
                            onLongPressStart();
                        }}
                        onPressOut={() => {
                            isLongPress && onLongPressEnd();
                        }}
                        style={{backgroundColor: 'black'}}
                    >
                        <Animated.Image
                            resizeMode="contain"
                            source={
                                { uri: photoSelected.uri === null ? photoSelected.filename : photoSelected.uri } as ImageSourcePropType
                            }
                            style={[
                                styles.image,
                                {
                                    transform: [{scale: scale}]
                                }
                            ]}
                            onLoad={_imageLoaded}
                        />

                        <ActivityIndicator
                            style={styles.activityIndicator}
                            animating={!imageLoaded}
                        />
                    </AnimatedPressable>
                </PinchGestureHandler>
            </GestureRecognizer>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    activityIndicator: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT
    }
});

export default LitterImage;
