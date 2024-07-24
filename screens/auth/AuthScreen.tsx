import React, { useState, useEffect, FC } from 'react';
import {
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    ImageStyle,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { useDispatch } from 'react-redux';
import { ForgotPasswordForm, SigninForm, SignupForm } from './authComponents';
import { loginOrSignupReset } from "../../reducers/auth_reducer";
import { Body, Colors } from '../components';

interface AuthScreenProps {
    route: any;
    navigation: any;
}

const AuthScreen: FC<AuthScreenProps> = ({ route, navigation }) => {

    const [formMode, setFormMode] = useState(route.params.screen);
    const [isLogoDisplayed, setIsLogoDisplayed] = useState(true);

    const dispatch = useDispatch();

    const handleOrientationChange = () => {
        const { width, height } = Dimensions.get('window');

        return {
            screenWidth: width,
            screenHeight: height,
            isPortrait: width <= height
        };
    };

    const [screenDimensions, setScreenDimensions] = useState(handleOrientationChange());

    useEffect(() => {
        const updateSizeVariables = () => {
            setScreenDimensions(handleOrientationChange());
        };

        const keyboardShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setIsLogoDisplayed(false)
        );
        const keyboardHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setIsLogoDisplayed(true)
        );

        const dimensionsListener = Dimensions.addEventListener('change', updateSizeVariables);

        const focusListener = navigation.addListener('focus', () => { dispatch(loginOrSignupReset()); });

        return () => {
            keyboardShowListener.remove();
            keyboardHideListener.remove();
            dimensionsListener.remove();
            focusListener();
        };
    }, [navigation]);

    const changeFormType = (screenType: 'login' | 'signup' | 'reset') => {

        dispatch(loginOrSignupReset());

        let newFormMode = 'LOGIN';

        switch (screenType) {
            case 'login':
                newFormMode = 'LOGIN';
                break;
            case 'signup':
                newFormMode = 'CREATE_ACCOUNT';
                break;
            case 'reset':
                newFormMode = 'FORGOT_PASSWORD';
                break;
            default:
                break;
        }

        setFormMode(newFormMode);
    };

    const toggleFormMode = () => {
        if (formMode === 'LOGIN') {
            changeFormType('signup');
        } else {
            changeFormType('login');
        }
    };

    const getText = () => {
        switch (formMode) {
            case 'CREATE_ACCOUNT':
                return 'auth.already-have';
            case 'LOGIN':
                return 'auth.create-account';
            case 'FORGOT_PASSWORD':
                return 'auth.back-to-login';
            default:
                return '';
        }
    };

    const renderForm = () => {
        switch (formMode) {
            case 'CREATE_ACCOUNT':
                return <SignupForm />;
            case 'LOGIN':
                return <SigninForm changeFormType={changeFormType} />;
            case 'FORGOT_PASSWORD':
                return <ForgotPasswordForm />;
            default:
                return <SignupForm />;
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                style={styles.outerContainer}
                behavior={Platform.select({ android: 'height', ios: 'padding' })}
                onLayout={handleOrientationChange}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps={'handled'}
                >
                    <View style={styles.authContainer}>
                        {screenDimensions.isPortrait && isLogoDisplayed && (
                            <Image
                                source={require('../../assets/logo/logo.png')}
                                style={[styles.logo, {
                                    height: screenDimensions.screenHeight / 4,
                                    width: screenDimensions.screenWidth * 0.8,
                                    left: screenDimensions.screenWidth * 0.1
                                } as ImageStyle]}
                            />
                        )}
                        <View style={styles.contentContainer}>

                            {renderForm()}

                            <View style={styles.buttonContainer}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View
                                        style={{
                                            backgroundColor: Colors.white,
                                            height: 1,
                                            flex: 1,
                                            alignSelf: 'center'
                                        }}
                                    />
                                    <Body
                                        style={styles.divider}
                                        dictionary={'auth.or'}
                                    />
                                    <View
                                        style={{
                                            backgroundColor: Colors.white,
                                            height: 1,
                                            flex: 1,
                                            alignSelf: 'center'
                                        }}
                                    />
                                </View>
                                <Pressable onPress={toggleFormMode} style={{ paddingTop: 10 }}>
                                    <Body
                                        color="white"
                                        dictionary={getText()}
                                    />
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1
    },
    scrollContainer: {
        flexGrow: 1,
        flexDirection: 'column'
    },
    container: {
        flex: 1,
        backgroundColor: Colors.info
    },
    authContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center'
    },
    contentContainer: {
        flexDirection: 'column',
        padding: 20
    },
    logo: {
        resizeMode: 'contain',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    divider: {
        color: Colors.white,
        alignSelf: 'center',
        paddingHorizontal: 5
    }
});

export default AuthScreen;
