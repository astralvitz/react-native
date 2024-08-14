import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, ScrollView, View, Pressable, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ActionSheet from 'react-native-actions-sheet';
import { Header, Title, Colors, Body, SubTitle, Caption, Button } from '../components';
import { CreateTeamForm, JoinTeamForm, TopTeamsList, UserTeamsList } from './teamComponents';
import StatusModal from './teamComponents/StatusModal';
import { useDispatch, useSelector } from "react-redux";
import { getTopTeams, clearTeamsForm } from "../../reducers/team_reducer";

const TeamScreen = ({ navigation }) => {

    const dispatch = useDispatch();
    const actionSheetRef = useRef();

    const [showFormType, setShowFormType] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const topTeams = useSelector(state => state.teams.topTeams);
    const teamFormStatus = useSelector(state => state.teams.teamFormStatus);
    const successMessage = useSelector(state => state.teams.successMessage);
    const token = useSelector(state => state.auth.token);

    useEffect(() =>{
        getTeams();
    }, []);

    const getTeams = async () => {
        await dispatch(getTopTeams(token));

        setIsLoading(false);
    };

    const actionSheetOnClose = () => {
        setShowFormType(null);

        dispatch(clearTeamsForm());
    };

    const onBackPress = () => {
        setShowFormType(null);

        dispatch(clearTeamsForm());
    };

    return (
        <>
            <Header
                leftContent={<Title color="white">Teams</Title>}
                rightContent={
                    <Pressable onPress={() => { actionSheetRef.current?.show() }}>
                        <Icon
                            color={Colors.white}
                            size={32}
                            name="add-outline"
                        />
                    </Pressable>
                }
            />
            {/* loading state */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={Colors.accent} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 20 }}
                    style={styles.container}
                    alwaysBounceVertical={false}
                    showsVerticalScrollIndicator={false}
                >
                    {/* list of top 5 teams  */}
                    {/* Top Teams */}
                    <View style={styles.headingRow}>
                        <SubTitle>Top Teams</SubTitle>
                        <Pressable onPress={() => navigation.navigate('TOP_TEAMS') }>
                            <Caption color="accent">View All</Caption>
                        </Pressable>
                    </View>

                    <TopTeamsList
                        topTeams={topTeams?.slice(0, 5)}
                    />

                    {/* list of users teams */}
                    <UserTeamsList
                        navigation={navigation}
                    />
                </ScrollView>
            )}

            <ActionSheet
                onClose={actionSheetOnClose}
                gestureEnabled
                ref={actionSheetRef}
            >
                <View style={{ padding: 20 }}>
                    {teamFormStatus === null ? (
                        <>
                            {!showFormType ? (
                                <>
                                    <Button onPress={() => setShowFormType('JOIN')}>
                                        <Body color="white">JOIN A TEAM</Body>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onPress={() => setShowFormType('CREATE')}
                                    >
                                        <Body color="accent">CREATE A TEAM</Body>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {showFormType === 'JOIN' ? (
                                        <JoinTeamForm backPress={onBackPress} />
                                    ) : (
                                        <CreateTeamForm backPress={onBackPress} />
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <StatusModal
                            text={successMessage}
                            type="SUCCESS"
                        />
                    )}
                </View>
            </ActionSheet>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20
    },
    headingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default TeamScreen;
