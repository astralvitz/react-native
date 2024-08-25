import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from "react-i18next";
import { createAccount } from "../../../reducers/auth_reducer";
import { useDispatch, useSelector } from "react-redux";
import { Colors, CustomTextInput, SubTitle } from '../../components';
import StatusMessage from './StatusMessage';

/**
 * Form field validation with keys for translation
 * using Yup for validation
 */
const SignupSchema = Yup.object().shape({
    username: Yup.string()
        .min(3, 'username-min-max')
        .max(20, 'username-min-max')
        .required('enter-username'),
    email: Yup.string().email('email-not-valid').required('enter-email'),
    password: Yup.string()
        .required('enter-password')
        .matches(/^(?=.*[A-Z])(?=.*[0-9]).{6,}$/, 'must-contain')
});

const SignupForm = () => {

    const dispatch = useDispatch();

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const usernameRef = useRef(null);

    const { serverStatusText, isSubmitting } = useSelector(state => state.auth);

    const { t } = useTranslation();
    const emailTranslation = t('auth.email-address');
    const passwordTranslation = t('auth.password');
    const usernameTranslation = t('auth.unique-username');

    return (
        <Formik
            initialValues={{ email: '', password: '', username: '' }}
            validationSchema={SignupSchema}
            onSubmit={({ email, password, username }) => {
                dispatch(createAccount({
                    email: email,
                    username: username,
                    password: password
                }));
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
                let infoMessage = "";

                if (serverStatusText) {
                    infoMessage = serverStatusText
                } else if (errors?.username) {
                    infoMessage = t(`auth.${errors.username}`);
                } else if (errors?.email) {
                    infoMessage = t(`auth.${errors.email}`);
                } else if (errors?.password) {
                    infoMessage = t(`auth.${errors.password}`);
                }

                return (
                    <View style={{flex: 1, justifyContent: 'center'}}>

                        {/* username input */}
                        <CustomTextInput
                            ref={usernameRef}
                            onSubmitEditing={() => emailRef?.current?.focus()}
                            style={{ marginBottom: 10 }}
                            onChangeText={handleChange('username')}
                            value={values.username}
                            name="username"
                            error={errors?.username}
                            touched={touched?.username}
                            placeholder={usernameTranslation}
                            leftIconName="at-outline"
                            returnKeyType="next"
                        />

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
                            returnKeyType="next"
                            keyboardType="email-address"
                            multiline
                        />

                        {/* password input */}
                        <CustomTextInput
                            ref={passwordRef}
                            style={{ marginBottom: 10 }}
                            onChangeText={handleChange('password')}
                            value={values.password}
                            name="password"
                            error={errors?.password}
                            touched={touched?.password}
                            placeholder={passwordTranslation}
                            leftIconName="key-outline"
                            secureTextEntry={!isPasswordVisible}
                            returnKeyType="done"
                            rightContent={
                                <Pressable onPress={() =>setIsPasswordVisible(!isPasswordVisible)}>
                                    <Icon
                                        style={styles.textFieldIcon}
                                        name={isPasswordVisible ? 'eye' : 'eye-off'}
                                        size={28}
                                        color={Colors.muted}
                                    />
                                </Pressable>
                            }
                        />

                        <StatusMessage
                            isSubmitting={isSubmitting}
                            serverStatusText={infoMessage}
                        />

                        <Pressable
                            disabled={isSubmitting}
                            onPress={handleSubmit}
                            style={styles.buttonStyle}>
                            {isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <SubTitle
                                    color="accentLight"
                                    dictionary={'auth.create-account'}
                                >
                                    Create Account
                                </SubTitle>
                            )}
                        </Pressable>
                    </View>
                );
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
    }
});

export default SignupForm;
