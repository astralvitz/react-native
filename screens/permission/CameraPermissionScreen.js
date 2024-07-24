import React, { useState, useEffect } from 'react';
import {
    AppState,
    StyleSheet,
    View,
    Image,
    Pressable,
    Platform,
    Linking,
    Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import { Title, Body, Colors, Caption } from '../components';
import {
    checkCameraPermission,
    checkLocationPermission,
    requestCameraPermission,
    requestLocationPermission
} from '../../utils/permissions';

const width = Dimensions.get('window').width;

const CameraPermissionScreen = ({ navigation, lang }) => {
    const [appState, setAppState] = useState(AppState.currentState);

    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (appState.match(/inactive|background/) && nextAppState === 'active') {
                checkPermissions();
            }
            setAppState(nextAppState);
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [appState]);

    const checkPermissions = async () => {
        const cameraPermission = await checkCameraPermission();
        const locationPermission = await checkLocationPermission();

        if (cameraPermission === 'granted' && locationPermission === 'granted') {
            navigation.navigate('CAMERA');
        }
    };

    const requestPermissions = async () => {
        const cameraResult = await requestCameraPermission();
        const locationResult = await requestLocationPermission();
        if (cameraResult === 'granted' && locationResult === 'granted') {
            navigation.navigate('CAMERA');
        } else {
            Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings();
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/illustrations/camera_permission.png')}
                style={styles.imageStyle}
            />
            <Title dictionary={'permission.please-give-permissions'} />
            <View style={styles.permissionContainer}>
                <View style={[styles.permissionItem, lang === 'ar' && {flexDirection: 'row-reverse'}]}>
                    <Icon name="camera" size={32} color={Colors.text} />
                    <View style={styles.itemBody}>
                        <Body style={lang === 'ar' && {textAlign: 'right'}} dictionary={'permission.camera-access'} />
                        <Caption style={lang === 'ar' && {textAlign: 'right'}} dictionary={'permission.camera-access-body'} />
                    </View>
                </View>
                <View style={[styles.permissionItem, lang === 'ar' && {flexDirection: 'row-reverse'}]}>
                    <Icon name="location" size={32} color={Colors.text} />
                    <View style={styles.itemBody}>
                        <Body style={lang === 'ar' && {textAlign: 'right'}} dictionary={'permission.location-access'} />
                        <Caption style={lang === 'ar' && {textAlign: 'right'}} dictionary={'permission.location-body'} />
                    </View>
                </View>
            </View>
            <Pressable style={styles.buttonStyle} onPress={requestPermissions}>
                <Body color="white" dictionary={'permission.allow-permission'} />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('HOME')}>
                <Body dictionary={'permission.not-now'} />
            </Pressable>
        </View>
    );
};

const mapStateToProps = state => ({
    lang: state.auth.lang
});

export default connect(mapStateToProps, actions)(CameraPermissionScreen);

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
    permissionContainer: {
        width: width - 80,
        marginTop: 20
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20
    },
    itemBody: { flexShrink: 1, marginHorizontal: 20 },
    buttonStyle: {
        paddingHorizontal: 28,
        paddingVertical: 20,
        backgroundColor: Colors.accent,
        borderRadius: 100,
        marginVertical: 32
    }
});
