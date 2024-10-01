import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    Modal,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Body, Header } from "../../components";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { fetchUploads } from "../../../reducers/my_uploads_reducer";
import ActionButton from "../../home/homeComponents/ActionButton";
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useTranslation} from "react-i18next";

const MyUploads = ({ navigation }) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        filterCountry: 'all',
        filterDateFrom: '',
        filterDateTo: '',
        filterTag: '',
        filterCustomTag: ''
    });
    const [page, setPage] = useState(1);
    const [paginationAmount, setPaginationAmount] = useState(25);
    const token = useSelector(state => state.auth.token);
    const myUploads = useSelector(state => state.my_uploads_reducer.uploads);

    useEffect(() => {
        async function fetchUploadsWrapper() {
            setLoading(true);

            await dispatch(fetchUploads({ token: token }));

            setLoading(false);
        }
        fetchUploadsWrapper();
    }, []);

    useEffect(() => {
        setUploads(myUploads);
    }, [myUploads]);

    const loadFilterModal = () => setShowModal(true);
    const closeFilterModal = () => setShowModal(false);

    // Functions to handle date picking
    const onChangeFromDate = (event, selectedDate) => {
        if (selectedDate) {
            setFilters({ ...filters, filterDateFrom: selectedDate });
        }
    };

    const onChangeToDate = (event, selectedDate) => {
        if (selectedDate) {
            setFilters({ ...filters, filterDateTo: selectedDate });
        }
    };

    const applyFilters = () => {
        setPage(1);

        dispatch(fetchUploads({
            token,
            page: 1,
            paginationAmount,
            filterCountry: filters.filterCountry,
            filterDateFrom: filters.filterDateFrom,
            filterDateTo: filters.filterDateTo,
            filterTag: filters.filterTag,
            filterCustomTag: filters.filter
        }));

        closeFilterModal();
    };

    const loadMoreUploads = () => setPage(page + 1);

    const parseTags = (tagsString, customTags, isTrustedUser) => {
        if (!tagsString && !customTags) {
            return isTrustedUser
                ? [<Text key="not-tagged">{t('litter.not-tagged-yet')}</Text>]
                : [<Text key="not-verified">{t('litter.not-verified')}</Text>];
        }

        let tags = [];
        let a = tagsString ? tagsString.split(',') : [];

        a.pop();

        a.forEach((i, index) => {
            let b = i.split(' ');

            if (b[0] === 'art.item') {
                tags.push(
                    <Text key={index} style={styles.tagText}>
                        {t('litter.' + b[0])}
                    </Text>
                );
            } else {
                tags.push(
                    <Text key={index} style={styles.tagText}>
                        {t('litter.' + b[0])}: {b[1]}
                    </Text>
                );
            }
        });

        return tags;
    }

    // Render each upload item
    const renderItem = ({ item }) => (
        <View style={styles.uploadItem}>
            <View style={styles.details}>
                {parseTags(item.result_string).map((tag, index) => (
                    <View key={index}>{tag}</View>
                ))}
            </View>
        </View>
    );

    return (
        <>
            <Header
                leftContent={
                    <Pressable
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => navigation.goBack()}
                    >

                        <Icon
                            name="chevron-back"
                            color="white"
                            size={18}
                            onPress={() => navigation.goBack()}
                        />

                        <Body color="white" style={{ marginLeft: 4 }}>Go Back</Body>
                    </Pressable>
                }
                rightContent={
                    <Body color="white" style={{ fontWeight: '600' }}>My Uploads</Body>
                }
            />

            <Modal animationType="slide" transparent={true} visible={showModal}>
                <View style={styles.modalContainer}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1 }}
                    >
                        <ScrollView contentContainerStyle={styles.modalScrollContent}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Filter Uploads</Text>

                                <Text style={styles.label}>Country</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={filters.filterCountry}
                                        onValueChange={(itemValue) => setFilters({ ...filters, filterCountry: itemValue })}
                                        style={styles.picker}
                                        itemStyle={styles.pickerItem}
                                        mode="dropdown"
                                    >
                                        <Picker.Item label="All Countries" value="all" />
                                        <Picker.Item label="USA" value="usa" />
                                        <Picker.Item label="Canada" value="canada" />
                                    </Picker>
                                </View>

                                <Text style={styles.label}>Tag</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter tag"
                                    placeholderTextColor={'#999'}
                                    value={filters.filterTag}
                                    onChangeText={(text) => setFilters({ ...filters, filterTag: text })}
                                />

                                <Text style={styles.label}>Custom Tag</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter custom tag"
                                    placeholderTextColor={'#999'}
                                    value={filters.filterCustomTag}
                                    onChangeText={(text) => setFilters({ ...filters, filterCustomTag: text })}
                                />

                                <View style={styles.datesContainer}>

                                    <View>
                                        <Text style={styles.label}>From Date</Text>
                                        <DateTimePicker
                                            value={filters.filterDateFrom || new Date()}
                                            mode="date"
                                            display="default"
                                            onChange={onChangeFromDate}
                                        />
                                    </View>

                                    <View>
                                        <Text style={styles.label}>To Date</Text>
                                        <DateTimePicker
                                            value={filters.filterDateTo || new Date()}
                                            mode="date"
                                            display="default"
                                            onChange={onChangeToDate}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.button} onPress={applyFilters}>
                                    <Text style={styles.buttonText}>Apply Filters</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, { backgroundColor: '#888' }]} onPress={closeFilterModal}>
                                    <Text style={styles.buttonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
                ) : (

                    <>
                        {/* Show what filters are selected */}
                        <View>
                            <Text style={styles.title}>Filters</Text>
                            <Text style={styles.date}>Country: {filters.filterCountry}</Text>
                            <Text style={styles.date}>Tag: {filters.filterTag}</Text>
                            <Text style={styles.date}>Custom Tag: {filters.filterCustomTag}</Text>
                            <Text style={styles.date}>From Date: {filters.filterDateFrom ? filters.filterDateFrom.toDateString() : 'Not set'}</Text>
                            <Text style={styles.date}>To Date: {filters.filterDateTo ? filters.filterDateTo.toDateString() : 'Not set'}</Text>
                        </View>

                        <FlatList
                            data={uploads}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderItem}
                            ListEmptyComponent={<Text style={styles.emptyListText}>No uploads to display.</Text>}
                        />
                    </>


                )}

                <ActionButton
                    onPress={loadFilterModal}
                    status="FILTER"
                />

            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    tags: {
        fontSize: 16,
        color: '#333',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '100%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 8,
        borderRadius: 5,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
    },
    picker: {
        width: '100%',
    },
    pickerItem: {
        backgroundColor: '#f0f0f0',
        height: 50,
        fontSize: 16
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    uploadItem: {
        backgroundColor: '#f0f0f0',
        marginBottom: 15,
        borderRadius: 10,
        overflow: 'hidden',
        padding: 10,
    },
    details: {
        padding: 10,
    },
    emptyListText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#999',
    },
    datesContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 10
    },
    dateInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 8,
        borderRadius: 5,
        justifyContent: 'center',
        marginBottom: 10,
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
});

export default MyUploads;
