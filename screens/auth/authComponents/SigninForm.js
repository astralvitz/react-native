import React, { useState, useRef, useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from "react-i18next";
import { userLogin} from '../../../reducers/auth_reducer';
import { Body, Colors, CustomTextInput, SubTitle } from '../../components';

/**
 * Form field validation with keys for translation
 * using Yup for validation
 */
const SigninSchema = Yup.object().shape({
    email: Yup.string().email('email-not-valid').required('enter-email'),
    password: Yup.string().required('enter-password')
});

const SigninForm = ({ changeFormType }) => {

    const dispatch = useDispatch();
    const { serverStatusText, isSubmitting } = useSelector(state => state.auth);

    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const { t } = useTranslation();
    const emailTranslation = t('auth.email-address');
    const passwordTranslation = t('auth.password');

    const handlePasswordVisibility = () => setIsPasswordVisible(prev => !prev);

    const handleFormSubmit = (handleSubmit) => {
        return () => {
            setHasSubmitted(true);
            handleSubmit();
        };
    };

    let infoMessage = "";

    return (
        <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={SigninSchema}
            onSubmit={({ email, password }) => {
                setHasSubmitted(true);
                dispatch(userLogin({ email, password }));
            }}
        >
            {({
                handleChange,
                setFieldValue,
                handleSubmit,
                values,
                errors,
                touched
            }) => {

                if (serverStatusText !== "") {
                    infoMessage = serverStatusText
                } else if (errors?.username) {
                    infoMessage = t(`auth.${errors.username}`);
                } else if (errors?.email) {
                    infoMessage = t(`auth.${errors.email}`);
                } else if (errors?.password) {
                    infoMessage = t(`auth.${errors.password}`);
                }

                const hasErrors = Object.keys(errors).length > 0;

                return (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        {/* email input */}
                        <CustomTextInput
                            ref={emailRef}
                            style={{ marginBottom: 10 }}
                            onSubmitEditing={() => passwordRef?.current?.focus()}
                            onChangeText={e => setFieldValue('email', e.trim().toLowerCase())}
                            value={values.email}
                            name="email"
                            error={errors?.email}
                            touched={touched?.email}
                            placeholder={emailTranslation}
                            leftIconName="mail-outline"
                            // returnKeyType="next"
                            keyboardType="email-address"
                            multiline
                        />

                        {/* password input */}
                        <CustomTextInput
                            ref={passwordRef}
                            onChangeText={handleChange('password')}
                            style={{marginBottom: 10}}
                            value={values.password}
                            name="password"
                            error={errors?.password}
                            touched={touched?.password}
                            placeholder={passwordTranslation}
                            leftIconName="key-outline"
                            secureTextEntry={!isPasswordVisible}
                            returnKeyType="done"
                            rightContent={
                                <Pressable
                                    onPress={handlePasswordVisibility}
                                >
                                    <Icon
                                        style={styles.textFieldIcon}
                                        name={isPasswordVisible ? 'eye' : 'eye-off'}
                                        size={28}
                                        color={Colors.muted}
                                    />
                                </Pressable>
                            }
                        />

                        <Pressable
                            style={{alignItems: 'flex-end'}}
                            onPress={() => changeFormType('reset')}>
                            <Body
                                color="white"
                                dictionary={'auth.forgot-password'}
                            />
                        </Pressable>

                        {
                            hasSubmitted && hasErrors && (
                                <Text style={styles.statusMessageTempFix}>
                                    { infoMessage }
                                </Text>
                            )
                        }

                        {/*<StatusMessage*/}
                        {/*    showError={hasSubmitted}*/}
                        {/*    serverStatusText={infoMessage}*/}
                        {/*/>*/}

                        <Pressable
                            disabled={isSubmitting}
                            onPress={handleFormSubmit(handleSubmit)}
                            style={[
                                styles.buttonStyle,
                                isSubmitting && styles.buttonDisabled
                            ]}>
                            {isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <SubTitle
                                    color="accentLight"
                                    dictionary={'auth.login'}
                                >
                                    Create Account
                                </SubTitle>
                            )}
                        </Pressable>
                    </View>
                )
            }}
        </Formik>
    );
}

const styles = StyleSheet.create({
    buttonStyle: {
        alignItems: 'center',
        backgroundColor: Colors.accent,
        borderRadius: 6,
        height: 60,
        opacity: 1,
        marginBottom: 10,
        justifyContent: 'center',
        width: '100%',
        marginTop: 20
    },
    textFieldIcon: {
        padding: 10
    },
    buttonDisabled: {
        opacity: 0.8
    },
    statusMessageTempFix: {
        color: 'white',
        textAlign: 'center',
        paddingTop: 10
    }
});

export default SigninForm;
