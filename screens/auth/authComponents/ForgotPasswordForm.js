import React from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import { Colors, SubTitle, CustomTextInput } from '../../components';
import { StatusMessage } from '.';
import { sendResetPasswordRequest} from "../../../reducers/auth_reducer";

/**
 * Form field validation with keys for translation
 * using Yup for validation
 */
const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
        .email('email-not-valid')
        .required('enter-email')
});

const ForgotPasswordForm = () => {

    const dispatch = useDispatch();

    const { serverStatusText, isSubmitting } = useSelector(state => state.auth);

    const { t } = useTranslation();
    const emailTranslation = t('auth.email-address');
    const emailErrorTranslation = t('auth.email-error');

    return (
        <Formik
            initialValues={{ email: '' }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={values => {
                dispatch(sendResetPasswordRequest(values.email));
            }}>
            {({
                handleSubmit,
                setFieldValue,
                values,
                errors,
                touched,
            }) => (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    {/* email input */}
                    <CustomTextInput
                        onChangeText={e =>
                            setFieldValue(
                                'email',
                                e.trim().toLocaleLowerCase()
                            )
                        }
                        value={values.email}
                        name="email"
                        error={
                            errors.email && emailErrorTranslation
                        }
                        touched={touched.email}
                        placeholder={emailTranslation}
                        leftIconName="mail"
                        keyboardType="email-address"
                        returnKeyType="done"
                        multiline
                    />

                    <StatusMessage
                        serverStatusText={serverStatusText}
                    />

                    <Pressable
                        disabled={isSubmitting}
                        onPress={handleSubmit}
                        style={[styles.buttonStyle]}>
                        {isSubmitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <SubTitle
                                color="accentLight"
                                dictionary={'auth.forgot-password'}
                            >
                                Create Account
                            </SubTitle>
                        )}
                    </Pressable>
                </View>
            )}
        </Formik>
    );
}

const styles = StyleSheet.create({
    buttonStyle: {
        alignItems: 'center',
        backgroundColor: Colors.warn,
        borderRadius: 6,
        height: 60,
        opacity: 1,
        marginBottom: 10,
        justifyContent: 'center',
        width: '100%',
        marginTop: 20
    },
    textfieldIcon: {
        padding: 10
    },
    buttonDisabled: {
        opacity: 0.5
    }
});

export default ForgotPasswordForm;
