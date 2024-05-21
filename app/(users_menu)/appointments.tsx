import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '../constants';

const AppointmentsScreen = () => {
  const [userId, setUserId] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [appointmentsData, setAppointmentsData] = useState({});
  const [workingHours, setWorkingHours] = useState({ startHour: 0, endHour: 24 });
  const [userAppointments, setUserAppointments] = useState([]);

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

      // Process the working hours from the response if available
      if (allAppointments.length > 0 && allAppointments[0].workingHours) {
        setWorkingHours(allAppointments[0].workingHours);
      }

      // Combine data to mark dates and store appointments data
      const combinedMarkings = allAppointments.reduce((acc, appointment) => {
        const dateString = appointment.date.slice(0, 10);
        if (appointment.isFull) {
          acc[dateString] = { disabled: true, disableTouchEvent: true, dotColor: 'red', marked: true };
        } else if (!acc[dateString]) {
          acc[dateString] = { selected: false, selectedColor: 'grey' };
        }

        // Store hourly availability data
        appointmentsData[dateString] = appointment.hourlyAvailability;
        return acc;
      }, {});

      setMarkedDates(combinedMarkings);
      setAppointmentsData(appointmentsData);
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
      const userAppointments = userAppointmentsResponse.data;

      setUserAppointments(userAppointments);
    } catch (error) {
      console.error('Failed to fetch user appointments:', error);
      Alert.alert("Error", "Unable to fetch user appointments");
    }
  };

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
  }, []);  // This runs only on component mount

  useEffect(() => {
    if (!userId) return; // Do not proceed if userId is not set
    fetchAppointments();
    fetchUserAppointments();
  }, [userId]); // This effect runs when userId changes

  const handleDayPress = (day) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);
    generateHourlySlots(dateString);
  };

  const generateHourlySlots = (dateString) => {
    const slots = [];
    for (let hour = workingHours.startHour; hour < workingHours.endHour; hour++) {
      const slot = appointmentsData[dateString]?.find(slot => slot.hour === hour) || {
        hour,
        spotsLeft: 7,
        isFull: false
      };

      // Check if the user has an appointment in this slot
      const userAppointment = userAppointments.find(
        appointment => appointment.date.slice(0, 10) === dateString && new Date(appointment.date).getHours() === hour
      );
      slots.push({ ...slot, userAppointment });
    }
    return slots;
  };

  const bookAppointment = async (dateString, hour) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const formattedDate = new Date(Date.UTC(year, month - 1, day, hour)).toISOString();

    const appointmentData = {
      UserId: userId,
      Date: formattedDate
    };

    console.log('Booking appointment with:', appointmentData); // Debugging log
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
        await fetchAppointments(); // Refresh appointments after booking
        await fetchUserAppointments(); // Refresh user appointments after booking
      } else {
        Alert.alert("Failed", "Failed to book the appointment.");
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      if (error.response) {
        console.log('Error response data:', error.response.data); // Additional error logging
        Alert.alert("Error", `Booking failed: You already have an appointment on this day.`);
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
      const apiUrl = `${API_URL}/Appointments/${appointmentId}`;
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const response = await axios.delete(apiUrl, config);
      if (response.status === 204) {
          Alert.alert("Success", "Your appointment has been canceled.");
          await fetchUserAppointments(); 
          await fetchAppointments(); 
      } else {
        Alert.alert("Failed", "Failed to cancel the appointment.");
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
      if (error.response) {
        console.log('Error response data:', error.response.data); // Additional error logging
        Alert.alert("Error", `Cancelation failed: ${error.response.data.message}`);
      } else {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleHourPress = async (slot) => {
    const now = new Date();
    const appointmentDateTime = new Date(selectedDate);
    appointmentDateTime.setHours(slot.hour, 0, 0, 0);

    if (slot.userAppointment) {
      if (now > appointmentDateTime) {
        Alert.alert("Cannot Cancel", "You cannot cancel an appointment that has already passed.");
        return;
      }
      Alert.alert(
        "Cancel Appointment",
        `Do you want to cancel your appointment at ${slot.hour}:00?`,
        [
          {
            text: "Yes",
            onPress: () => cancelAppointment(slot.userAppointment.id),
          },
          {
            text: "No",
          },
        ]
      );
    } else {
      // if (now > appointmentDateTime) {
      //   Alert.alert("Cannot Book", "You cannot book an appointment for a past date.");
      //   return;
      // }
      Alert.alert(
        "Confirm Appointment",
        `Do you want to book an appointment at ${slot.hour}:00?`,
        [
          {
            text: "Yes",
            onPress: () => bookAppointment(selectedDate, slot.hour),
          },
          {
            text: "No",
          },
        ]
      );
    }
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
        markedDates={markedDates}
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
          {generateHourlySlots(selectedDate).map(slot => (
            <TouchableOpacity
              key={slot.hour}
              style={[
                styles.hourSlot,
                slot.isFull && styles.fullSlot,
                slot.userAppointment && styles.userAppointmentSlot,
              ]}
              disabled={slot.isFull}
              onPress={() => handleHourPress(slot)}
            >
              <Text style={styles.hourText}>
                {`${slot.hour}:00`} - Spots Left: {slot.spotsLeft}
              </Text>
              {slot.userAppointment && (
                <Text style={styles.cancelText}>Tap to cancel</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
  fullSlot: {
    backgroundColor: '#ffcccb',
  },
  userAppointmentSlot: {
    backgroundColor: '#c8e6c9',
  },
  hourText: {
    fontSize: 16,
    color: '#2d4059',
  },
  cancelText: {
    fontSize: 12,
    color: '#d9534f',
  },
});

export default AppointmentsScreen;
