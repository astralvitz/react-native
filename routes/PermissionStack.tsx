import React, { FC } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CameraPermissionScreen, GalleryPermissionScreen } from '../screens';

type PermissionStackParamList = {
    GalleryPermissionScreen: any;
    CameraPermissionScreen: any;
}

const Stack = createStackNavigator<PermissionStackParamList>();

const PermissionStack: FC = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* @ts-ignore */}
            <Stack.Screen name="GALLERY_PERMISSION" component={GalleryPermissionScreen} />
            {/* @ts-ignore */}
            <Stack.Screen name="CAMERA_PERMISSION" component={CameraPermissionScreen} />
        </Stack.Navigator>
    );
};

export default PermissionStack;
