import React, { useEffect } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SubTitle, Body, Caption, Colors } from '../../components';
import { useDispatch, useSelector } from "react-redux";
import { getUserTeams, setSelectedTeam } from "../../../reducers/team_reducer";
import TeamListCard from './TeamListCard';

const UserTeamsList = ({ navigation }) => {

    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.token);
    const userTeams = useSelector(state => state.teams.userTeams);
    const user = useSelector(state => state.auth.user);
    const activeTeam = user?.active_team_id;

    useEffect(() => {
        async function handleGetUserTeams(token) {
            await dispatch(getUserTeams(token));
        }

        handleGetUserTeams(token);
    }, []);

    const setTeam = team => {
        dispatch(setSelectedTeam(team));

        navigation.navigate('TEAM_DETAILS');
    };

    const navigateToTeamDetails = () => {
        navigation.navigate('TEAM_DETAILS');
    }

    return (
        <>
            {/* Users Teams */}
            <View style={[styles.headingRow, { marginTop: 20 }]}>
                <SubTitle>My Teams</SubTitle>

                <Pressable onPress={navigateToTeamDetails}>
                    <Caption
                        color="accent"
                        style={{ backgroundColor: 'red', padding: 5 }}
                    >View All</Caption>
                </Pressable>
            </View>

            {userTeams?.map((team, index) => (
                <Pressable
                    onPress={() => setTeam(team)}
                    key={`${team.name}${index}`}
                >
                    <TeamListCard
                        team={team}
                        index={index}
                        showRanking={false}
                        leftContent={
                            <View style={{ height: 24, width: 24 }}>
                                {activeTeam === team.id && (
                                    <Icon
                                        name="star-sharp"
                                        size={24}
                                        color={Colors.accent}
                                    />
                                )}
                            </View>
                        }
                    />
                </Pressable>
            ))}
        </>
    );
}

const styles = StyleSheet.create({
    headingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline'
    },
    alignRight: {
        textAlign: 'right'
    }
});

export default UserTeamsList;
