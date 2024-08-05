import React, { useEffect } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SubTitle, Body, Caption, Colors } from '../../components';
import { useDispatch } from "react-redux";
import TeamListCard from './TeamListCard';

const UserTeamsList = () => {

    const dispatch = useDispatch();

    useEffect(() => {

        // dispatch(getUserTeams(token));

    }, []);

    // setTeam = team => {
    //     this.props.setSelectedTeam(team);
    //     this.props.navigation.navigate('TEAM_DETAILS');
    // };

    const { userTeams, user } = this.props;
    const activeTeam = user?.active_team;

    return (
        <>
            {/* Users Teams */}
            <View style={[styles.headingRow, { marginTop: 20 }]}>
                <SubTitle>My Teams</SubTitle>
                {/* <Caption color="accent">View All</Caption> */}
            </View>
            {userTeams?.map((team, index) => (
                <Pressable
                    onPress={() => this.setTeam(team)}
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
