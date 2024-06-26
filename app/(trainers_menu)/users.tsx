import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, Modal, StyleSheet, Alert, Platform, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants';

let DateTimePicker;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

const ManageUsersAppointments = () => {
  const [originalUsers, setOriginalUsers] = useState([]); 
  const [users, setUsers] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [startHour, setStartHour] = useState(''); 
  const [endHour, setEndHour] = useState(''); 

  const fetchData = async (applyFilter = false) => {
    const token = await SecureStore.getItemAsync('token');
    if (!token) {
      console.error('Authentication token not found');
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/Appointments/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = response.data;
      setOriginalUsers(usersData);
      if (applyFilter) {
        setUsers(filterUsersByDate(usersData, date));
      } else {
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Failed to fetch user appointments:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    setIsFilterActive(true);
    setUsers(filterUsersByDate(originalUsers, currentDate)); 
  };

  const filterUsersByDate = (usersData, selectedDate) => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    return usersData.filter(user =>
      user.appointments.some(app => app.date.startsWith(formattedDate))
    );
  };

  const cancelAppointment = async (appointmentId) => {
    const token = await SecureStore.getItemAsync('token');
    if (!token) {
      console.error('Authentication token not found');
      return;
    }
    try {
      const response = await axios.delete(`${API_URL}/Appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 204) {
        fetchData(isFilterActive);  
      } else {
        Alert.alert("Failed", "Failed to cancel the appointment.");
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      Alert.alert("Error", "Failed to cancel appointment.");
    }
  };

  const resetFilter = () => {
    setDate(new Date());
    setIsFilterActive(false);
    setUsers(originalUsers);  
  };

  const setWorkingHours = async () => {
    const token = await SecureStore.getItemAsync('token');
    if (!token) {
      console.error('Authentication token not found');
      return;
    }
    const startHourInt = parseInt(startHour, 10);
    const endHourInt = parseInt(endHour, 10);

    if (isNaN(startHourInt) || isNaN(endHourInt) || startHourInt < 0 || startHourInt > 23 || endHourInt < 0 || endHourInt > 23) {
      Alert.alert("Error", "Please enter valid hours between 0 and 23.");
      return;
    }

    if (startHourInt >= endHourInt) {
      Alert.alert("Error", "Start hour must be less than end hour.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/Appointments/SetWorkingHours`, {
        StartHour: startHourInt,
        EndHour: endHourInt
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 200) {
        Alert.alert("Success", "Working hours updated successfully.");
        setStartHour('');
        setEndHour('');
      } else {
        Alert.alert("Failed", "Failed to update working hours.");
      }
    } catch (error) {
      console.error('Failed to set working hours:', error);
      Alert.alert("Error", "Failed to set working hours.");
    }
  };

  const renderAppointmentItem = ({ item }) => {
    return (
      <View style={styles.appointmentItem}>
        <Text style={styles.appointmentDate}>{item.date}</Text>
        <Button
          title="Cancel"
          onPress={() => cancelAppointment(item.id)}
          color="#ff4757"
        />
      </View>
    );
  };

  const renderUserAppointments = ({ item }) => {
    if (!Array.isArray(item.appointments) || item.appointments.length === 0) {
      console.warn('User has no appointments or appointments is not an array:', item);
      return null;
    }
    return (
      <View style={styles.userContainer}>
        <Text style={styles.userName}>{item.username}</Text>
        <FlatList
          data={item.appointments}
          keyExtractor={(app) => app.id.toString()}
          renderItem={renderAppointmentItem}
          horizontal={false}
          style={styles.appointmentsList}
        />
      </View>
    );
  };

  const renderDatePickerModal = () => {
    return (
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChange}
              style={{ width: '100%' }}
            />
            <Button title="Done" onPress={() => setShowDatePicker(false)} />
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.workingHoursContainer}>
          <Text style={styles.subtitle}>Set Working Hours</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Start Hour</Text>
              <TextInput
                style={styles.input}
                placeholder="Start Hour"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={startHour}
                onChangeText={setStartHour}
                maxLength={2} 
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>End Hour</Text>
              <TextInput
                style={styles.input}
                placeholder="End Hour"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={endHour}
                onChangeText={setEndHour}
                maxLength={2} 
              />
            </View>
          </View>
          <Button title="Set Working Hours" onPress={setWorkingHours} />
        </View>
        {isFilterActive && <Text style={styles.title}>Filtered by date: {date.toDateString()}</Text>}
        <Button onPress={() => setShowDatePicker(true)} title="Search user appointments by date" />
        {renderDatePickerModal()}
        <FlatList
          data={users}
          keyExtractor={(item) => item.username}
          renderItem={renderUserAppointments}
          style={styles.userList}
        />
        <View style={styles.resetButton}>
          <Button onPress={resetFilter} title="Reset" color="black" />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#111827', 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F3F4F6', 
    marginBottom: 15,
  },
  userList: {
    marginTop: 15,
  },
  userContainer: {
    flexDirection: 'column', 
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#1F2937', 
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
    color: '#E5E7EB', 
  },
  appointmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#374151', 
    borderRadius: 5,
    marginTop: 5,
  },
  appointmentDate: {
    fontSize: 16,
    color: '#D1D5DB', 
  },
  resetButton: {
    marginTop: 15,
    backgroundColor: '#2563EB', 
    borderRadius: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#1F2937', 
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  appointmentsList: {
    flexGrow: 0,
    marginTop: 10,
  },
  workingHoursContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#1F2937',
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F3F4F6',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputContainer: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 14,
    color: '#F3F4F6',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    backgroundColor: '#374151',
    color: '#F3F4F6', 
  },
});

export default ManageUsersAppointments;
