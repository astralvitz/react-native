import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { Body, Colors, Header, StatsGrid, Title } from '../components';
import { ProgressCircleCard } from './userComponents';
import { fetchUser } from "../../reducers/auth_reducer";
import { useDispatch, useSelector } from "react-redux";

const UserStatsScreen = ({ navigation }) => {

    const dispatch = useDispatch();

    const token = useSelector(state => state.auth.token);
    const user = useSelector(state => state.auth.user);

    const [xpStart, setXpStart] = useState(0);
    const [positionStart, setPositionStart] = useState(0);
    const [totalImagesStart, setTotalImagesStart] = useState(0);
    const [totalTagsStart, setTotalTagsStart] = useState(0);
    const [levelStart, setLevelStart] = useState(0);
    const [levelPercentageStart, setLevelPercentageStart] = useState(0);
    const [littercoinStart, setLittercoinStart] = useState(0);
    const [littercoinPercentageStart, setLittercoinPercentageStart] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {

        const fetchData = async () => {
            await getDataFromStorage();

            await dispatch(fetchUser(token));

            await fetchUserData();
        }

        fetchData();

    }, []);

    const getDataFromStorage = async () => {

        const previousStats = await AsyncStorage.getItem('previousUserStats');

        if (previousStats !== undefined && previousStats !== null) {
            const {
                xp,
                position,
                totalImages,
                totalTags,
                level,
                levelPercentage,
                littercoin,
                littercoinPercentage
            } = JSON.parse(previousStats);

            setXpStart(xp);
            setPositionStart(position);
            setTotalImagesStart(totalImages);
            setTotalTagsStart(totalTags);
            setLevelStart(level);
            setLevelPercentageStart(levelPercentage);
            setLittercoinStart(littercoin);
            setLittercoinPercentageStart(littercoinPercentage);
        }

        setIsLoading(false);
    }

    const fetchUserData = async () => {

        if (user)
        {
            const statsObj = {
                xp: user?.xp_redis,
                position: user?.position,
                totalImages: user?.total_images || 0,
                totalTags: user?.totalTags,
                level: user?.level,
                levelPercentage: user?.targetPercentage,
                littercoin: user?.totalLittercoin,
                littercoinPercentage: user?.total_images % 100
            };

            // INFO: previous stats saved for animation purpose
            // so value animates from previous viewd and current
            await AsyncStorage.setItem('previousUserStats', JSON.stringify(statsObj));
        }
    }

    const statsData = [
        {
            value: user?.xp_redis || xpStart,
            startValue: xpStart,
            title: `user.XP`,
            icon: 'medal-outline',
            color: '#14B8A6',
            bgColor: '#CCFBF1'
        },
        {
            value: user?.position || positionStart,
            startValue: positionStart,
            title: `user.rank`,
            icon: 'podium-outline',
            color: '#A855F7',
            bgColor: '#F3E8FF',
            ordinal: true
        },
        {
            value: user?.total_images || totalImagesStart,
            startValue: totalImagesStart,
            title: `user.photos`,
            icon: 'images-outline',
            color: '#F59E0B',
            bgColor: '#FEF9C3'
        },
        {
            value: user?.totalTags || totalTagsStart,
            startValue: totalTagsStart,
            title: `user.tags`,
            icon: 'pricetags-outline',
            color: '#0EA5E9',
            bgColor: '#E0F2FE'
        }
    ];

    return (
        <>
            <Header
                leftContent={
                    <View>
                        <Title
                            color="white"
                            dictionary={`user.welcome`}
                        />
                        <Body color="white">{user?.username}</Body>
                    </View>
                }
                rightContent={
                    <Pressable>
                        <Icon
                            name="settings-outline"
                            color="white"
                            size={24}
                            onPress={() => { navigation.navigate('SETTING'); }}
                        />
                    </Pressable>
                }
            />
            {user === null || user === undefined || isLoading ? (
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'white'
                    }}
                >
                    <ActivityIndicator
                        size="small"
                        color={Colors.accent}
                    />
                </View>
            ) : (
                <ScrollView
                    style={styles.container}
                    showsVerticalScrollIndicator={false}
                    alwaysBounceVertical={false}
                >
                    <ProgressCircleCard
                        level={user?.level}
                        levelStart={levelStart}
                        levelPercentage={user?.targetPercentage}
                        levelPercentageStart={levelPercentageStart}
                        xpRequired={user?.xpRequired}
                        totalLittercoin={user?.totalLittercoin}
                        littercoinStart={littercoinStart}
                        littercoinPercentage={user?.total_images % 100}
                        littercoinPercentageStart={littercoinPercentageStart}
                    />

                    <StatsGrid
                        statsData={statsData}
                    />
                </ScrollView>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    statsContainer: {
        marginTop: 20,
        padding: 10
    },
    statsRow: {
        justifyContent: 'space-between',
        flexDirection: 'row'
    }
});

export default UserStatsScreen;
