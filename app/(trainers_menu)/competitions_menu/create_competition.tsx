import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, StyleSheet, Button, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { createCompetition } from '../../Logic/createCompetitionService';
import { publish } from '../../event';
import DropDownPicker from 'react-native-dropdown-picker';
import { CheckBox } from '@rneui/base';

let DateTimePicker;
if (Platform.OS !== 'web') {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
}

const MACHINE_OPTIONS = [
    { label: 'Calf Raises', value: 'Calf Raises' },
    { label: 'Leg Press', value: 'Leg Press' },
    { label: 'Bench Press', value: 'Bench Press' },
    { label: 'Shoulder Press', value: 'Shoulder Press' },
    { label: 'Rowing Machine', value: 'RowingMachine' },
    { label: 'Lateral Raises', value: 'Lateral Raises' },
];

const CreateCompetitionPage = () => {
    const [competitionName, setCompetitionName] = useState('');
    const [competitionType, setCompetitionType] = useState(null);
    const [description, setDescription] = useState('');
    const [machines, setMachines] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const onChangeStartDate = (event, selectedDate) => {
        const currentDate = selectedDate || startDate;
        setShowStartDatePicker(false);
        setStartDate(currentDate);
    };

    const onChangeEndDate = (event, selectedDate) => {
        const currentDate = selectedDate || endDate;
        setShowEndDatePicker(false);
        setEndDate(currentDate);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString();
    };

    const renderDatePickerModal = (dateType) => {
        let currentDate = dateType === 'start' ? startDate : endDate;
        let setShowModal = dateType === 'start' ? setShowStartDatePicker : setShowEndDatePicker;

        return (
            <Modal
                visible={dateType === 'start' ? showStartDatePicker : showEndDatePicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        {Platform.OS === 'web' ? (
                            <input
                                type="date"
                                onChange={e => {
                                    const newDate = new Date(e.target.value);
                                    dateType === 'start' ? setStartDate(newDate) : setEndDate(newDate);
                                }}
                                value={currentDate.toISOString().split('T')[0]}
                            />
                        ) : (
                            <DateTimePicker
                                value={currentDate}
                                mode="date"
                                display="default"
                                onChange={dateType === 'start' ? onChangeStartDate : onChangeEndDate}
                            />
                        )}
                        <Button title="Done" onPress={() => setShowModal(false)} />
                    </View>
                </View>
            </Modal>
        );
    };

    const handleMachineChange = (machine) => {
        setMachines((prevMachines) => {
            if (prevMachines.includes(machine)) {
                return prevMachines.filter((m) => m !== machine);
            } else {
                return [...prevMachines, machine];
            }
        });
    };

    const submitCompetition = async () => {
        if (!competitionName || !competitionType || !description) {
            alert('Competition Name, Type, and Description are required');
            return;
        }

        const competitionData = {
            name: competitionName,
            competitionType,
            description,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            machines: competitionType !== 'Cardio' ? machines : [], 
        };
        console.log('Competition Data:', competitionData);
        const result = await createCompetition(competitionData);
        if (result.success) {
            alert('Competition Created Successfully');
            publish('competitionCreated');  
            router.navigate('/competitions_menu/competitions');
        } else {
            alert('Failed to create competition: ' + result.message);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Create Competition</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    onChangeText={setCompetitionName}
                    value={competitionName}
                    placeholder="Competition Name"
                    placeholderTextColor="#999"
                />
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, styles.descriptionInput]}
                    onChangeText={setDescription}
                    value={description}
                    placeholder="Description"
                    placeholderTextColor="#999"
                    multiline
                />
            </View>
            <View style={styles.pickerContainer}>
                <Text style={styles.label}>Competition Type:</Text>
                <DropDownPicker
                    listMode='SCROLLVIEW'
                    open={open}
                    value={competitionType}
                    items={[
                        { label: 'Cardio', value: 'Cardio' },
                        { label: 'Strength', value: 'Strength' },
                        { label: 'Mixed', value: 'Mixed' },
                    ]}
                    setOpen={setOpen}
                    setValue={setCompetitionType}
                    placeholder="Select Competition Type"
                    style={styles.picker}
                    dropDownContainerStyle={styles.pickerDropdown}
                    placeholderStyle={styles.placeholderStyle}
                    textStyle={styles.pickerTextStyle}
                />
            </View>
            {competitionType && competitionType !== 'Cardio' && (
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Select Machines:</Text>
                    {MACHINE_OPTIONS.map((machine) => (
                        <CheckBox
                            key={machine.value}
                            title={machine.label}
                            checked={machines.includes(machine.value)}
                            onPress={() => handleMachineChange(machine.value)}
                            containerStyle={styles.checkboxContainer}
                            textStyle={styles.checkboxText}
                        />
                    ))}
                </View>
            )}
            <View style={styles.inputContainer}>
                <Pressable onPress={() => setShowStartDatePicker(true)} style={styles.datePickerButton}>
                    <Text style={styles.datePickerText}>Select Start Date</Text>
                </Pressable>
                <Text style={styles.dateText}>Start Date: {formatDate(startDate)}</Text>
                {renderDatePickerModal('start')}
            </View>
            <View style={styles.inputContainer}>
                <Pressable onPress={() => setShowEndDatePicker(true)} style={styles.datePickerButton}>
                    <Text style={styles.datePickerText}>Select End Date</Text>
                </Pressable>
                <Text style={styles.dateText}>End Date: {formatDate(endDate)}</Text>
                {renderDatePickerModal('end')}
            </View>
            <Pressable onPress={submitCompetition} style={styles.createButton}>
                <Text style={styles.buttonText}>Create Competition</Text>
            </Pressable>
            <Pressable onPress={() => router.navigate('/competitions_menu/competitions')} style={styles.backButton}>
                <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#111827', 
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        color: '#F3F4F6', 
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    pickerContainer: {
        width: '100%',
        marginBottom: 20,
        paddingHorizontal: 10,
        zIndex: 1000, 
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 10,
        backgroundColor: '#1F2937', 
        color: '#F3F4F6', 
        width: '100%',
    },
    descriptionInput: {
        height: 80,
    },
    picker: {
        height: 50,
        width: '100%',
        backgroundColor: '#1F2937', 
        borderColor: '#ccc',
    },
    pickerDropdown: {
        backgroundColor: '#1F2937', 
        borderColor: '#ccc',
    },
    placeholderStyle: {
        color: '#F3F4F6', 
    },
    pickerTextStyle: {
        color: '#F3F4F6', 
    },
    checkboxContainer: {
        width: '100%',
        marginVertical: 5,
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
    },
    checkboxText: {
        color: '#F3F4F6', 
    },
    datePickerButton: {
        marginVertical: 10,
        padding: 10,
        backgroundColor: '#1F2937',
        alignItems: 'center',
        width: '100%',
    },
    datePickerText: {
        color: '#F3F4F6', 
    },
    dateText: {
        color: '#E5E7EB', 
    },
    backButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#1F2937', 
        alignItems: 'center',
        width: '100%',
    },
    backButtonText: {
        color: '#F3F4F6', 
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: '#1F2937', 
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    createButton: {
        marginTop: 20,
        backgroundColor: '#2563EB', 
        padding: 10,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: 'white',
    },
    label: {
        marginBottom: 5,
        fontSize: 16,
        color: '#F3F4F6', 
    },
});

export default CreateCompetitionPage;
