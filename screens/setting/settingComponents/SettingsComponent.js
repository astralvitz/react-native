import React, { useState, useEffect, createRef } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableHighlight,
    View
} from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Body, Colors, CustomTextInput, Header, SubTitle } from '../../components';
import Icon from 'react-native-vector-icons/Ionicons';
import {
    closeSecondSettingModal,
    deleteAccount,
    saveSocialAccounts,
    setDeleteAccountError, settingsInit, toggleSettingsModal,
    updateSettingsProp
} from "../../../reducers/settings_reducer";
import {settings} from "@react-native/eslint-config";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const SettingsComponent = ({ dataToEdit }) => {

    const dispatch = useDispatch();

    const formikRef = createRef();
    const [password, setPassword] = useState('');

    useEffect(() => {
        getTextInputValue();
    }, []);

    const settingsEditProp = useSelector(state => state.settings.settingsEditProp);
    const lang = useSelector(state => state.auth.lang);
    const secondSettingsModalVisible = useSelector(state => state.settings.secondSettingsModalVisible);
    const updateSettingsStatusMessage = useSelector(state => state.settings.updateSettingsStatusMessage);
    const updatingSettings = useSelector(state => state.settings.updatingSettings);
    const user = useSelector(state => state.auth.user);
    const token = useSelector(state => state.auth.token);
    const deleteAccountError = useSelector(state => state.settings.deleteAccountError);

    const getForm = (dataToEdit, lang) => {
        const key = ['name', 'username', 'email'];

        // get conditional validation schema
        const validationSchema = Yup.object().shape(
            getSchema(dataToEdit.key)
        );

        // form for name, username, email
        if (key.includes(dataToEdit.key)) {
            return (
                <Formik
                    initialValues={{
                        [dataToEdit.key]: settingsEditProp
                    }}
                    innerRef={formikRef}
                    validationSchema={validationSchema}
                    onSubmit={values => {
                        // dispatch(saveSettings(
                        //     this.props.dataToEdit,
                        //     settingsEditProp,
                        //     this.props.token
                        // ));
                    }}>
                    {({
                          handleChange,
                          handleBlur,
                          setFieldValue,
                          handleSubmit,
                          values,
                          errors,
                          touched
                      }) => (
                        <View style={styles.container}>
                            <Body
                                dictionary={`${this.props.dataToEdit.title}`}
                            />

                            <CustomTextInput
                                style={styles.content}
                                // ref={this.usernameRef}
                                onChangeText={text => {
                                    setFieldValue(`${dataToEdit.key}`, text);
                                    dispatch(updateSettingsProp({text}));
                                }}
                                value={settingsEditProp}
                                name={`${dataToEdit.key}`}
                                autoCapitalize="none"
                                error={
                                    errors[`${dataToEdit.key}`] &&
                                    `$auth.${errors[`${dataToEdit.key}`]}`
                                }
                                touched={touched[`${dataToEdit.key}`]}
                            />
                        </View>
                    )}
                </Formik>
            );
        } else if (dataToEdit.key === 'social') {
            const formFields = [
                'twitter',
                'facebook',
                'instagram',
                'linkedin',
                'reddit',
                'personal'
            ];
            const placeholders = [
                'https://twitter.com/olm',
                'https://www.facebook.com/olm',
                'https://www.instagram.com/olm',
                'https://www.linkedin.com/olm',
                'https://www.reddit.com/user/olm/',
                'https://www.openlittermap.com'
            ];
            return (
                <Formik
                    initialValues={{
                        twitter: settingsEditProp?.social_twitter,
                        facebook: settingsEditProp?.social_facebook,
                        instagram:
                        settingsEditProp?.social_instagram,
                        linkedin: settingsEditProp?.social_linkedin,
                        reddit: settingsEditProp?.social_reddit,
                        personal: settingsEditProp?.social_personal
                    }}
                    innerRef={formikRef}
                    validationSchema={validationSchema}
                    onSubmit={values => {
                        dispatch(saveSocialAccounts({
                            dataToEdit,
                            settingsEditProp,
                            token
                        }));
                    }}>
                    {({setFieldValue, setFieldTouched, errors, touched}) => (
                        <ScrollView
                            alwaysBounceVertical={false}
                            showsVerticalScrollIndicator={false}
                            style={styles.container}
                        >
                            {formFields.map((field, index) => (
                                <View key={field}>
                                    <Body>{field.toLocaleUpperCase()}</Body>
                                    <CustomTextInput
                                        style={styles.content}
                                        onEndEditing={() =>
                                            setFieldTouched(`${field}`, true)
                                        }
                                        onChangeText={text => {
                                            setFieldValue(`${field}`, text);

                                            // this.props.updateSettingsProp(
                                            //     {
                                            //         ...this.props
                                            //             .settingsEditProp,
                                            //         [`social_${field}`]: text
                                            //     },
                                            //     'social'
                                            // );
                                        }}
                                        value={
                                            settingsEditProp &&
                                            settingsEditProp[
                                                `social_${field}`
                                                ]
                                        }
                                        name={`${field}`}
                                        autoCapitalize="none"
                                        error={
                                            errors[`${field}`] &&
                                            `settings.${errors[`${field}`]}`
                                        }
                                        touched={touched[`${field}`]}
                                        placeholder={`${placeholders[index]}`}
                                    />
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </Formik>
            );
        }
        else if (dataToEdit.key === 'delete-account')
        {
            return (
                <View style={styles.deleteAccountContainer}>
                    <Text style={styles.deleteAccountTitle}>
                        Are you sure you want to delete your account?
                    </Text>
                    <Text style={styles.deleteAccountSubtitle}>
                        All of your data will be deleted.
                    </Text>
                    <Text style={styles.deleteAccountSubtitle}>
                        This cannot be undone.
                    </Text>

                    <TextInput
                        placeholder="Please enter your password"
                        placeholderTextColor="grey"
                        style={{
                            height: 40,
                            borderColor: 'gray',
                            borderWidth: 1,
                            paddingHorizontal: 8
                        }}
                        onChangeText={changeTextHandler}
                        value={password}
                        secureTextEntry={true}
                    />

                    <Pressable
                        style={styles.deleteAccountButton}
                        onPress={submitDeleteAccount}>
                        <Text style={styles.deleteButtonText}>
                            Delete account
                        </Text>
                    </Pressable>

                    {deleteAccountError !== '' ? (
                        <View>
                            <Text
                                style={styles.wrongPasswordText}
                            >
                                useTranslation(`${deleteAccountError}`)
                            </Text>
                        </View>
                    ) : (
                        ''
                    )}
                </View>
            );
        }
    };

    const changeTextHandler = (txt) => {

        setPassword(txt);

        if (deleteAccountError !== '') {
            dispatch(setDeleteAccountError(''));
        }
    };

    /**
     * Fn to return Validation schema
     */
    const getSchema = (key) => {
        /**
         * Form field validation with keys for translation
         * using Yup for validation
         */
        const NameSchema = {
            name: Yup.string()
                .min(3, 'name-min-max')
                .max(20, 'name-min-max')
                .required('enter-name')
        };

        const UsernameSchema = {
            username: Yup.string()
                .min(3, 'username-min-max')
                .max(20, 'username-min-max')
                .required('enter-username')
        };

        const EmailSchema = {
            email: Yup.string().email('email-not-valid').required('enter-email')
        };

        const SocialSchema = {
            twitter: Yup.string().url('url-not-valid'),
            facebook: Yup.string().url('url-not-valid'),
            instagram: Yup.string().url('url-not-valid'),
            linkedin: Yup.string().url('url-not-valid'),
            reddit: Yup.string().url('url-not-valid'),
            personal: Yup.string().url('url-not-valid')
        };

        switch (key) {
            case 'name':
                return NameSchema;
            case 'username':
                return UsernameSchema;
            case 'email':
                return EmailSchema;
            case 'social':
                return SocialSchema;
        }
    };

    /**
     * render modal messages based on vale of updateSettingsStatusMessage
     * ERROR || SUCCESS
     */
    const renderStatusMessage = (status, lang) => {
        let success = status === 'SUCCESS';
        let error = status === 'ERROR';

        if (success || error)
        {
            return (
                <View style={styles.innerModalSuccess}>
                    {/*<ElementIcon*/}
                    {/*    reverse*/}
                    {/*    name={success ? 'done' : 'close'}*/}
                    {/*    color={success ? '#2ecc71' : '#E25B69'}*/}
                    {/*    size={40}*/}
                    {/*    containerStyle={styles.iconContainer}*/}
                    {/*/>*/}
                    <Text style={styles.innerModalHeader}>
                        useTranslation({
                        success
                            ? `settings.success`
                            : `settings.error`
                    })
                    </Text>
                    <Text>
                        useTranslation({
                        success
                            ? `settings.value-updated`
                            : `settings.value-not-updated`
                    })
                    </Text>
                    <TouchableHighlight
                        style={styles.successButton}
                        activeOpacity={0.9}
                        underlayColor="#00aced"
                        onPress={() => goBack()}
                    >
                        <Text style={styles.buttonText}>
                            useTranslation(`settings.go-back`)
                        </Text>
                    </TouchableHighlight>
                </View>
            );
        }
        return <></>;
    }

    /**
     * Custom Functions
     */
    const closeModal = () => {
        dispatch(toggleSettingsModal());
    }

    /**
     * Header title
     *
     * eg Edit Name
     */
    const getHeaderName = () => {
        const text = useTranslation(`${dataToEdit.title}`);

        if (this.props.dataToEdit.key === 'delete-account') {
            return useTranslation(`${settings.warning}`);
        }

        const edit = useTranslation(`${settings.edit}`);

        return edit + ' ' + text;
    }

    /**
     * Save the settings within a component
     *
     * settings_actions.js
     */
    const saveSettings = () => {
        if (formikRef.current) {
            formikRef.current.handleSubmit();
        }
    }

    const goBack = () => {
        dispatch(closeSecondSettingModal());

        // Parent modal only closes with timeout
        setTimeout(() => {
            dispatch(toggleSettingsModal());
        }, 500);
    }

    /**
     * Initialize Settings Value to edit / update
     */
    const getTextInputValue = () => {
        const key = dataToEdit.key;

        switch (key) {
            case 'name':
                return dispatch(settingsInit(user.name));
            case 'username':
                return dispatch(settingsInit(user.username));
            case 'email':
                return dispatch(settingsInit(user.email));
            case 'social':
                return dispatch(settingsInit(user.settings));
        }
    }

    /**
     * Send a request to delete the account and all associated data
     */
    const submitDeleteAccount = () => {
        dispatch(deleteAccount({ password, token }));
    };


    return (
        <>
            <Header
                leftContent={
                    <Pressable onPress={() => closeModal()}>
                        <Icon
                            name="close-outline"
                            size={32}
                            color="white"
                        />
                    </Pressable>
                }
                centerContent={
                    <SubTitle
                        color="white"
                        style={{
                            textAlign: 'center'
                        }}>
                        {getHeaderName()}
                    </SubTitle>
                }
                rightContent={
                    dataToEdit.key !== 'delete-account' ? (
                        <Pressable onPress={() => saveSettings()}>
                            <Body
                                color="white"
                                dictionary={`settings.save`}
                            />
                        </Pressable>
                    ) : (
                        ''
                    )
                }
            />

            {getForm(dataToEdit, lang)}

            <Modal
                animationType="slide"
                transparent={true}
                visible={secondSettingsModalVisible}>
                <View style={styles.modalContainer}>
                    {renderStatusMessage(updateSettingsStatusMessage)}
                    {updatingSettings && updateSettingsStatusMessage === '' && (
                        <ActivityIndicator />
                    )}
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    buttonText: {
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        paddingHorizontal: 20,
        paddingTop: 10,
        backgroundColor: '#f7f7f7'
    },
    content: {
        marginTop: 10,
        paddingLeft: 10,
        height: 48,
        maxHeight: 48
    },
    deleteAccountButton: {
        height: SCREEN_HEIGHT * 0.05,
        width: SCREEN_WIDTH * 0.8,
        marginTop: 20,
        backgroundColor: 'red',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8
    },
    deleteButtonText: {
        color: 'white',
        fontSize: SCREEN_HEIGHT * 0.02
    },
    deleteAccountContainer: {
        padding: SCREEN_WIDTH * 0.1
    },
    deleteAccountTitle: {
        fontSize: SCREEN_HEIGHT * 0.045,
        marginBottom: SCREEN_HEIGHT * 0.025
    },
    deleteAccountSubtitle: {
        fontSize: SCREEN_HEIGHT * 0.035,
        marginBottom: SCREEN_HEIGHT * 0.025
    },
    row: {
        alignItems: 'center',
        // flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: 'white',
        height: SCREEN_HEIGHT * 0.06
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    innerModalSuccess: {
        // height: SCREEN_HEIGHT * 0.2,
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        width: SCREEN_WIDTH * 0.8
    },
    innerModalHeader: {
        textAlign: 'center',
        fontSize: 28,
        marginBottom: 10
    },
    iconContainer: {
        marginTop: -70
    },
    successButton: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: '#2189dc',
        // backgroundColor: '#2ecc71',
        height: SCREEN_HEIGHT * 0.05,
        marginTop: 20,
        width: '80%'
    },
    title: {
        paddingLeft: 10,
        fontSize: SCREEN_HEIGHT * 0.02,
        width: SCREEN_WIDTH * 0.25
    },
    wrongPasswordText: {
        marginTop: 20,
        color: Colors.error
    }
});

// const mapStateToProps = state => {
//     return {
//         dataToEdit: state.settings.dataToEdit,
//         lang: state.auth.lang,
//         secondSettingsModalVisible: state.settings.secondSettingsModalVisible,
//         settingsEditProp: state.settings.settingsEditProp,
//         token: state.auth.token,
//         updatingSettings: state.settings.updatingSettings,
//         updateSettingsStatusMessage: state.settings.updateSettingsStatusMessage,
//         user: state.auth.user,
//         deleteAccountError: state.settings.deleteAccountError
//     };
// };

export default SettingsComponent;
