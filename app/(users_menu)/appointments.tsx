import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '../constants';
import MachineBookingModal from '../components/MachineBookingModal';

const AppointmentsScreen = () => {
  const [userId, setUserId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [appointmentsData, setAppointmentsData] = useState({});
  const [workingHours, setWorkingHours] = useState({ startHour: 0, endHour: 24 });
  const [userAppointments, setUserAppointments] = useState([]);
  const [machines, setMachines] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);
  const [hourlySlots, setHourlySlots] = useState([]);

  const fetchAppointments = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert("Error", "No token found, please login again.");
        return;
      }
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const allAppointmentsResponse = await axios.get(`${API_URL}/Appointments`, config);
      const allAppointments = allAppointmentsResponse.data;
      console.log('All Appointments:', allAppointments);

      const formattedData = {};
      allAppointments.forEach(appointment => {
        const date = appointment.date.split('T')[0];
        if (!formattedData[date]) {
          formattedData[date] = [];
        }
        formattedData[date] = appointment.hourlyAvailability;
      });

      setAppointmentsData(formattedData);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      Alert.alert("Error", "Unable to fetch appointments");
    }
  };
  
  const fetchUserAppointments = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert("Error", "No token found, please login again.");
        return;
      }
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const userAppointmentsResponse = await axios.get(`${API_URL}/Appointments/user/${userId}`, config);
      setUserAppointments(userAppointmentsResponse.data);
    } catch (error) {
      console.error('Failed to fetch user appointments:', error);
      Alert.alert("Error", "Unable to fetch user appointments");
    }
  };

  const fetchMachines = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert("Error", "No token found, please login again.");
        return;
      }
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const machinesResponse = await axios.get(`${API_URL}/Machines`, config);
      setMachines(machinesResponse.data);
      console.log('Machines:', machinesResponse.data);
    } catch (error) {
      console.error('Failed to fetch machines:', error);
      Alert.alert("Error", "Unable to fetch machines");
    }
  };

  const fetchWorkingHours = async () => {
    try {
      const workingHoursResponse = await axios.get(`${API_URL}/Appointments/getWorkingHours`);
      setWorkingHours(workingHoursResponse.data);
    } catch (error) {
      console.error('Failed to fetch working hours:', error);
      Alert.alert("Error", "Unable to fetch working hours");
    }
  }

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userJson = await SecureStore.getItemAsync('user');
        const user = JSON.parse(userJson);
        if (user?.id) {
          setUserId(user.id);
        } else {
          Alert.alert("Error", "No user ID found, please login again.");
        }
      } catch (error) {
        console.error('Error retrieving user ID:', error);
        Alert.alert("Error", "Failed to retrieve user ID.");
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchAppointments();
    fetchUserAppointments();
    fetchMachines();
    fetchWorkingHours();
  }, [userId]);

  const handleDayPress = (day) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);
    setHourlySlots(generateHourlySlots(dateString));
  };

  const handleHourPress = (hour) => {
    if (userHasAppointment(hour)) {
      const appointmentId = getUserAppointmentId(hour);
      cancelAppointment(appointmentId);
    } else {
      setSelectedHour(hour);
      setModalVisible(true);
    }
  };

  const bookAppointment = async (hour, machineBookings) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const formattedDate = new Date(Date.UTC(year, month - 1, day, hour)).toISOString();

    const appointmentData = {
      UserId: userId,
      Date: formattedDate,
      MachineBookings: machineBookings
    };

    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert("Error", "No token found, please login again.");
        return;
      }
      const apiUrl = `${API_URL}/Appointments/book`;
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      const response = await axios.post(apiUrl, appointmentData, config);
      if (response.status === 201) {
        Alert.alert("Success", "Your appointment has been booked!");
        await fetchAppointments();
        await fetchUserAppointments();
      } else {
        Alert.alert("Failed", "Failed to book the appointment.");
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      if (error.response) {
        Alert.alert("Error", `Booking failed: ${error.response.data}`);
      } else {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert("Error", "No token found, please login again.");
        return;
      }
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.delete(`${API_URL}/Appointments/${appointmentId}`, config);
      if (response.status === 204) {
        Alert.alert("Success", "Your appointment has been cancelled!");
        await fetchAppointments();
        await fetchUserAppointments();
      } else {
        Alert.alert("Failed", "Failed to cancel the appointment.");
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      Alert.alert("Error", "Unable to cancel appointment");
    }
  };

  const userHasAppointment = (hour) => {
    return userAppointments.some(app => new Date(app.date).getHours() === hour && new Date(app.date).toDateString() === new Date(selectedDate).toDateString());
  };

  const getUserAppointmentId = (hour) => {
    const appointment = userAppointments.find(app => new Date(app.date).getHours() === hour && new Date(app.date).toDateString() === new Date(selectedDate).toDateString());
    return appointment?.id;
  };

  const generateHourlySlots = (dateString) => {
    const slots = [];
    console.log('Appointments data for', dateString, ':', appointmentsData[dateString]);

    for (let hour = workingHours.startHour; hour < workingHours.endHour; hour++) {
      const hourlyData = appointmentsData[dateString]?.find(slot => slot.hour === hour)?.machineAvailabilities || [];
      console.log('Hourly data for', hour, ':', hourlyData);

      const hourSlots = machines.map(machine => {
        const machineData = hourlyData.find(data => data.machineId === machine.id) || {};
        return {
          machineId: machine.id,
          machineName: machine.name,
          type: machine.type,
          slotsLeft: machineData.slotCount !== undefined ? machineData.slotCount : (machine.type === 'Strength' ? 4 : 2)
        };
      });

      slots.push({ hour, slots: hourSlots });
    }

    return slots;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a date for your appointment</Text>
      <Calendar
        current={Date()}
        minDate={Date()}
        maxDate={'2024-07-31'}
        onDayPress={handleDayPress}
        monthFormat={'yyyy MM'}
        hideExtraDays={true}
        hideArrows={false}
        style={styles.calendar}
        theme={{
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          textSectionTitleDisabledColor: '#d9e1e8',
          selectedDayBackgroundColor: '#2a9d8f',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#f4a261',
          dayTextColor: '#2d4059',
          textDisabledColor: '#d9e1e8',
          dotColor: '#2a9d8f',
          selectedDotColor: '#ffffff',
          arrowColor: '#2a9d8f',
          disabledArrowColor: '#d9e1e8',
          monthTextColor: '#2a9d8f',
          indicatorColor: 'blue',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 16
        }}
      />
      {selectedDate && (
        <ScrollView style={styles.scrollView}>
          <Text style={styles.subtitle}>Available slots for {selectedDate}:</Text>
          {hourlySlots.map((slot, index) => (
            <TouchableOpacity
              key={`${slot.hour}-${index}`}
              style={[
                styles.hourSlot,
                userHasAppointment(slot.hour) ? styles.userAppointmentSlot : null
              ]}
              onPress={() => handleHourPress(slot.hour)}
            >
              <Text style={styles.hourText}>{`${slot.hour}:00`}</Text>
              {userHasAppointment(slot.hour) && (
                <Text style={styles.cancelText}>Cancel appointment</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <MachineBookingModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        hour={selectedHour}
        machines={machines}
        slots={hourlySlots.find(slot => slot.hour === selectedHour)?.slots || []}
        onBook={bookAppointment}
      />
    </View>
  );
};

const windowWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2a9d8f',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    width: windowWidth * 0.9,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollView: {
    marginTop: 20,
    width: windowWidth * 0.9,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d4059',
    marginBottom: 10,
    textAlign: 'center',
  },
  hourSlot: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#e0f7fa',
    borderRadius: 5,
    alignItems: 'center',
  },
  userAppointmentSlot: {
    backgroundColor: '#d4edda',
  },
  hourText: {
    fontSize: 16,
    color: '#2d4059',
  },
  cancelText: {
    color: '#d9534f',
    marginTop: 5,
    fontSize: 14,
  },
});

export default AppointmentsScreen;
