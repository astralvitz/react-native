import React, { useState, useEffect, useCallback } from 'react';
import {
    AppState,
    Image,
    Linking,
    Platform,
    Pressable,
    StyleSheet,
    View
} from 'react-native';
import { Body, Colors, Title } from '../components';
import {
    checkAccessMediaLocation,
    checkCameraRollPermission,
    requestCameraRollPermission
} from '../../utils/permissions';
import * as Sentry from '@sentry/react-native';

const GalleryPermissionScreen = ({ navigation }) => {

    const [appState, setAppState] = useState(AppState.currentState);

    const handleAppStateChange = useCallback((nextAppState) => {
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
            checkGalleryPermission();
        }
        setAppState(nextAppState);
    }, [appState]);

    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (AppState.currentState.match(/inactive|background/) && nextAppState === 'active') {
                checkGalleryPermission();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => subscription.remove();
    }, []); // Note: This effect does not depend on `appState`.

    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => subscription.remove();
    }, [handleAppStateChange]);

    const checkGalleryPermission = async () => {
        const result = await checkCameraRollPermission();

        if (result.toLowerCase() === 'granted') {
            navigation.navigate('HOME');
        } else {
            Sentry.captureException(new Error(`Gallery Permission Error ${result}`), {
                level: 'error',
                tags: {
                    section: 'checkGalleryPermission',
                    result
                }
            });
        }
    };

    const requestGalleryPermission = async () => {
        const result = await requestCameraRollPermission();

        if (result === 'granted' || result === 'limited') {
            if (Platform.OS === 'android' && Platform.Version >= 33) {
                const accessMediaLocation = await checkAccessMediaLocation();
                console.log('GalleryPermissionScreen.accessMediaLocation', accessMediaLocation);
            }

            navigation.navigate('HOME');
        } else {
            Sentry.captureException(new Error(`Gallery Permission Error ${result}`), {
                level: 'error',
                tags: {
                    section: 'requestGalleryPermission',
                    platform: Platform.OS
                }
            });

            Platform.OS === 'ios'
                ? await Linking.openURL('app-settings:')
                : await Linking.openSettings();
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/illustrations/gallery_permission.png')}
                style={styles.imageStyle}
            />
            <Title dictionary={'permission.allow-gallery-access'} />
            <Body
                color="muted"
                style={styles.bodyText}
                dictionary={'permission.gallery-body'}
            >
                Please provide us access to your gallery, which is required if you want to
                upload geotagged images from gallery.
            </Body>
            <Pressable
                style={styles.buttonStyle}
                onPress={requestGalleryPermission}
            >
                <Body color="white" dictionary={'permission.allow-gallery-access'} />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('HOME')}>
                <Body dictionary={'permission.not-now'} />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        padding: 20
    },
    imageStyle: {
        width: 300,
        height: 300
    },
    bodyText: {
        textAlign: 'center',
        marginVertical: 20
    },
    buttonStyle: {
        paddingHorizontal: 28,
        paddingVertical: 20,
        backgroundColor: Colors.accent,
        borderRadius: 100,
        marginVertical: 32
    }
});

export default GalleryPermissionScreen;
