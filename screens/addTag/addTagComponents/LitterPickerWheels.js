import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import { useDispatch, useSelector } from "react-redux";
import { changeItem, changeQ } from "../../../reducers/litter_reducer";

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

// Creating array of quantities [1 --- 100]
const QUANTITIES = [...Array(100).keys()].map(i => i + 1);

// interface LitterPickerWheelsProps {
//     item: any;
//     category: any;
// }

const LitterPickerWheels = ({ item, category }) => {

    const dispatch = useDispatch();

    const { t } = useTranslation();

    const items = useSelector(state => state.litter.items);
    const q = useSelector(state => state.litter.q);

    const handleItemChange = (newItem) => {
        dispatch(changeItem(newItem));
    };

    return (
        <View
            style={{
                marginHorizontal: 20,
                marginBottom: 10,
                flexDirection: 'row',
                backgroundColor: '#fafafa',
                borderRadius: 8
            }}>
            <Picker
                itemStyle={styles.itemStyle}
                style={{width: SCREEN_WIDTH * 0.7 - 20}}
                selectedValue={item}
                onValueChange={item => handleItemChange(item)}
            >
                {items.map((item, i) => {
                    const label = t(`litter.${category.title}.${item}`);

                    return <Picker.Item label={label} value={item} key={i} />;
                })}
            </Picker>
            <Picker
                itemStyle={styles.itemStyle}
                style={{width: SCREEN_WIDTH * 0.3 - 20}}
                selectedValue={q}
                onValueChange={q => dispatch(changeQ(q))}>
                {QUANTITIES.map((q, i) => (
                    <Picker.Item label={q.toString()} value={q} key={i} />
                ))}
            </Picker>
        </View>
    );
}

const styles = StyleSheet.create({
    itemStyle: {
        height: SCREEN_HEIGHT * 0.125,
        fontSize: 20,
        fontFamily: 'Poppins-Regular',
        letterSpacing: 0.5
    }
});

export default LitterPickerWheels;
