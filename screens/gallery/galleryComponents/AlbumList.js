import React, { useEffect} from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Colors, Body } from '../../components';
import AlbumCard from './AlbumCard';
import { getPhotosFromCameraroll } from "../../../reducers/gallery_reducer";

const AlbumList = () => {

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getPhotosFromCameraroll())
    }, [])

    const { imagesLoading, geotaggedImages } = useSelector(state => state.gallery);

    if (geotaggedImages?.length > 0) {
        return (
            <AlbumCard
                albumName="Geotagged"
                thumbnail={geotaggedImages[0]?.uri}
                counter={geotaggedImages.length}
                navigation={navigation}
            />
        );
    }

    if (imagesLoading)
    {
        return (
            <View style={styles.container}>
                <ActivityIndicator
                    color={Colors.accent}
                />
            </View>
        );
    }
    else if (geotaggedImages?.length === 0)
    {
        return (
            <View style={styles.container}>
                <Body>No geotagged photos found</Body>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default AlbumList;
