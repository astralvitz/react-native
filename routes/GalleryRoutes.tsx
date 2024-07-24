import React, { FC } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { GalleryScreen, AlbumScreen } from '../screens';

type GalleryStackParamList = {
    GALLERY: any;
    ALBUM: any;
};

const Stack = createStackNavigator<GalleryStackParamList>();

const GalleryStack: FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}>
            <Stack.Screen name="GALLERY" component={GalleryScreen} />
            <Stack.Screen name="ALBUM" component={AlbumScreen} />
        </Stack.Navigator>
    );
};

export default GalleryStack;
