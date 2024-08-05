import React, { useState, useEffect, FC } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createSelector } from 'reselect';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUser, checkValidToken, logout } from '../reducers/auth_reducer';

import AuthStack from './AuthStack';
import TabRoutes from './TabRoutes';
import PermissionStack from './PermissionStack';
import { GalleryScreen, NewUpdateScreen,  SettingScreen } from '../screens';
import AddTags from '../screens/addTag/AddTags';

// interface AuthDetails {
//     token: string | null;
//     tokenIsValid: boolean;
// }
//
// interface AppState {
//     auth: {
//         token: string | null;
//         tokenIsValid: boolean;
//     };
// }

const Stack = createStackNavigator();

const MainRoutes = () => {

    const [isLoading, setIsLoading] = useState(true);

    // Define a selector that computes derived data from the state and memoizes the output.
    // @ts-ignore
    const getAuthDetails = createSelector(
        // @ts-ignore
        state => state.auth.token,
        // @ts-ignore
        state => state.auth.tokenIsValid,
        (token, tokenIsValid) => ({ token, tokenIsValid })
    );

    // Re-render component when token or validity changes.
    // @ts-ignore
    const { token, tokenIsValid } = useSelector(getAuthDetails);

    const dispatch = useDispatch();

    async function bootstrapAuthentication (dispatch) {
        const jwt = await AsyncStorage.getItem('jwt');

        if (jwt)
        {
            // @ts-ignore
            await dispatch(checkValidToken(jwt));

            // Assuming a synchronous action that updates tokenIsValid state
            if (tokenIsValid) {
                // @ts-ignore
                await dispatch(fetchUser(jwt));
            } else {
                dispatch(dispatch(logout()));
            }
        }

        setIsLoading(false);
    }

    useEffect(() => {

        dispatch(logout());

        bootstrapAuthentication(dispatch, setIsLoading).then(() => console.log('bootstrapped'));
    }, [dispatch]);

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator />
            </View>
        );
    } else {
        return (
            <Stack.Navigator
                // @ts-ignore
                presentation="modal"
                screenOptions={{
                    headerShown: false
                }}>
                {token === null ? (
                    <Stack.Screen name="AUTH_HOME" component={AuthStack} />
                ) : (
                    <>
                        <Stack.Screen name="APP" component={TabRoutes} />
                        <Stack.Screen name="PERMISSION" component={PermissionStack} />
                        <Stack.Screen name="ADD_TAGS" component={AddTags} />
                        <Stack.Screen name="ALBUM" component={GalleryScreen} />
                        <Stack.Screen name="SETTING" component={SettingScreen} />
                        <Stack.Screen name="UPDATE" component={NewUpdateScreen} />
                    </>
                )}
            </Stack.Navigator>
        );
    }
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default MainRoutes;
