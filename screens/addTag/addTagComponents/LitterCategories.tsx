import React from 'react';
import { useDispatch } from "react-redux";
import { Dimensions, FlatList, Image, Platform, Pressable, StyleSheet, View} from 'react-native';
import { Body, Colors } from '../../components';
import { changeCategory } from "../../../reducers/litter_reducer";

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface Category {
    id: string;
    title: string;
    path: any; // Replace 'any' with the type of 'category.path'
}

interface Props {
    categories: Category[];
    selectedCategory: Category;
    lang: string;
    changeCategory?: (id: string) => void;
}

const LitterCategories: React.FC<Props> = ({
    categories,
    selectedCategory,
}) => {

    const dispatch = useDispatch()

    /**
     * Change Category
     *
     * litter_actions, litter_reducer
     */
    const handleChangeCategory = (category: string) => {
        dispatch(changeCategory(category));
    }

    /**
     * Each category to display
     */
    const renderCategory = (category: Category) => {

        const cardStyle = Platform.select({
            ios: styles.cardiOS,
            android: styles.cardAndroid
        });

        return (
            <Pressable
                onPress={() => handleChangeCategory(category.title)}
                key={category.id}
            >
                <View
                    style={[
                        cardStyle,
                        category.title === selectedCategory.title && styles.selectedCard
                    ]}
                >
                    <Image
                        source={category.path}
                        style={styles.image}
                    />
                    <Body
                        color={category.title === category.title ? 'text' : 'muted'}
                        dictionary={`litter.categories.${category.title}`}
                    />
                </View>
            </Pressable>
        );
    }

    /**
     * The list of categories
     */
    return (
        <View style={{marginVertical: 20}}>
            <FlatList
                contentContainerStyle={{paddingHorizontal: 10}}
                showsHorizontalScrollIndicator={false}
                data={categories}
                horizontal={true}
                renderItem={({item}) => renderCategory(item)}
                keyExtractor={category => category.title}
                keyboardShouldPersistTaps="handled"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    cardiOS: {
        height: SCREEN_HEIGHT * 0.085,
        minWidth: SCREEN_WIDTH * 0.2,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
        borderRadius: 12,
        padding: 8,
        borderWidth: 2,
        borderColor: Colors.accentLight,
        backgroundColor: Colors.white
    },
    cardAndroid: {
        height: SCREEN_HEIGHT * 0.1,
        minWidth: SCREEN_WIDTH * 0.2,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
        borderRadius: 12,
        padding: 8,
        borderWidth: 2,
        borderColor: Colors.accentLight,
        backgroundColor: Colors.white
    },
    selectedCard: {
        backgroundColor: Colors.accent,
        borderColor: Colors.accentLight
    },
    category: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6
    },
    image: {
        borderRadius: 6,
        height: 30,
        resizeMode: 'contain',
        width: 30
    }
});

export default LitterCategories;
