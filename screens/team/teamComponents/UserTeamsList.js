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

    const activeTeamId = user?.active_team;

    useEffect(() => {
        async function handleGetUserTeams(token) {
            await dispatch(getUserTeams(token));
        }

        handleGetUserTeams(token);
    }, []);

    const selectTeam = team => {
        dispatch(setSelectedTeam(team));

        navigation.navigate('TEAM_DETAILS');
    };

    return (
        <>
            {/* Users Teams */}
            <View style={[styles.headingRow, { marginTop: 20 }]}>
                <SubTitle>My Teams</SubTitle>
            </View>

            {userTeams?.map((team, index) => (
                <Pressable
                    onPress={() => selectTeam(team)}
                    key={`${team?.name}${index}`}
                >
                    { team && (
                        <TeamListCard
                            team={team}
                            index={index}
                            showRanking={false}
                            leftContent={
                                <View style={{ height: 24, width: 24 }}>
                                    {activeTeamId === team?.id && (
                                        <Icon
                                            name="star-sharp"
                                            size={24}
                                            color={Colors.accent}
                                        />
                                    )}
                                </View>
                            }
                        />
                        )
                    }
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
