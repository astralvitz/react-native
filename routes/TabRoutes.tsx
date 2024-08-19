import React from 'react';
import { View, SafeAreaView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {
    HomeScreen,
    LeaderboardsScreen,
    GlobalDataScreen,
    UserStatsScreen
} from '../screens';
import TeamStack from './TeamStack';
// @ts-ignore
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../screens/components';

const Tab = createMaterialTopTabNavigator();

const TabRoutes: React.FC = () => (
    <>
        <Tab.Navigator
            tabBarPosition="bottom"
            initialRouteName="HOME"
            // @ts-ignore
            showIcon={true}
            tabStyle={{ backgroundColor: '#000' }}
            screenOptions={({ route }) => ({
                // @ts-ignore
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'HOME':
                            iconName = focused ? 'home' : 'home-outline';
                            break;

                        case 'TEAM':
                            iconName = focused ? 'people' : 'people-outline';
                            break;

                        case 'GLOBAL_DATA':
                            iconName = focused ? 'trending-up' : 'trending-up-outline';
                            break;

                        // case 'RANKING':
                        //     iconName = focused
                        //         ? 'trophy'
                        //         : 'trophy-outline';
                        //     break;

                        case 'LEADERBOARDS':
                            iconName = focused ? 'trophy' : 'trophy-outline';
                            break;

                        // case 'MAP':
                        //     iconName = focused ? 'map' : 'map-outline';
                        //
                        //     break;

                        case 'CAMERA':
                            iconName = focused ? 'camera' : 'camera-outline';
                            break;

                        case 'USER_STATS':
                            iconName = focused ? 'person' : 'person-outline';
                            break;

                        default:
                            break;
                    }

                    return (
                        <View
                            style={{
                                backgroundColor: focused
                                    ? `${Colors.accentLight}`
                                    : 'white',
                                width: 50,
                                height: 50,
                                borderRadius: 100,
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignContent: 'center',
                                padding: 0,
                                marginTop: -5
                            }}>
                            <Icon name={iconName} size={24} color={color} />
                        </View>
                    );
                },
                tabBarActiveTintColor: `${Colors.accent}`,
                tabBarInactiveTintColor: 'gray',
                tabBarShowIcon: true,
                tabBarShowLabel: false,
                tabBarIconStyle: {
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center'
                },
                pressColor: 'white',
                pressOpacity: 0,
                indicatorStyle: {display: 'none', backgroundColor: 'white'},
                style: {
                    backgroundColor: 'white',
                    borderTopWidth: 0,
                    height: 60,
                    margin: 0,
                    padding: 0
                },
                lazy: true
            })}
        >
            <Tab.Screen name="HOME" component={HomeScreen} />
            {/*<Tab.Screen*/}
            {/*    name="CAMERA"*/}
            {/*    component={CameraScreen}*/}
            {/*    options={{ unmountOnBlur: true }}*/}
            {/*/>*/}
            <Tab.Screen name="TEAM" component={TeamStack} />
            <Tab.Screen name="GLOBAL_DATA" component={GlobalDataScreen} />
            <Tab.Screen name="LEADERBOARDS" component={LeaderboardsScreen} />
            {/*<Tab.Screen name="MAP" component={MapScreen} />*/}
            <Tab.Screen name="USER_STATS" component={UserStatsScreen} />
        </Tab.Navigator>
        <SafeAreaView />
    </>
);

export default TabRoutes;
