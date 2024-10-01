import React from 'react'
import {View, Text, StyleSheet, Dimensions, TouchableOpacity} from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width;

const ShowMyUploadsButton = ({ navigation }) => {

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => { navigation.navigate('MY_UPLOADS'); }}
            >
                <Text style={styles.text}>View My Uploads</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#27ae60',
        justifyContent: 'center',
        marginLeft: SCREEN_WIDTH * 0.25,
        marginRight: SCREEN_WIDTH * 0.25,
        padding: 10,
        borderRadius: 20,
        marginTop: 10
    },
    text: {
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
        fontWeight: 500
    }
});

export default ShowMyUploadsButton;
