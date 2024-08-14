import React from 'react';
import { ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSelector } from "react-redux";
import Icon from 'react-native-vector-icons/Ionicons';
import { Header, Title, Colors } from '../components';
import { TopTeamsList } from './teamComponents';

const TopTeamsScreen = ({ navigation }) => {
    const topTeams = useSelector(state => state.team.topTeams );

    return (
        <>
            <Header
                leftContent={
                    <Pressable onPress={() => navigation.goBack()}>
                        <Icon
                            name="chevron-back-outline"
                            color={Colors.white}
                            size={24}
                        />
                    </Pressable>
                }
                centerContent={<Title color="white">Top Teams</Title>}
                centerContainerStyle={{ flex: 2 }}
            />
            <ScrollView
                style={styles.container}
                alwaysBounceVertical={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* list of top 5 teams */}
                <TopTeamsList
                    topTeams={topTeams}
                />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20
    }
});

export default TopTeamsScreen;
