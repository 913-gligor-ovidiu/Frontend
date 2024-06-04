import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, ScrollView, Modal, SafeAreaView, TouchableOpacity, Alert, Image } from "react-native";
import { Camera, CameraView } from "expo-camera";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from "../constants";
import { publish } from "../event";


const exerciseImages = {
  "Calf Raises": require('../assets/AparatGambe.jpg'),
  "TreadMill": require('../assets/Banda.jpg'),
  "Leg Press": require('../assets/PresaPicioare.jpg'),
  "Bench Press": require('../assets/PresaPiept.jpg'),
  "Shoulder Press": require('../assets/PresaUmeri.jpg'),
  "RowingMachine": require('../assets/Ramat.jpg'),
  "Lateral Raises": require('../assets/RidicariUmeri.jpg'),
};

const WorkoutsScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showExerciseData, setShowExerciseData] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerId, setTimerId] = useState(null);
  const [workoutData, setWorkoutData] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerModalVisible, setScannerModalVisible] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [workoutActive, setWorkoutActive] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appointmentEndTime, setAppointmentEndTime] = useState(null);
  const [allAppointments, setAllAppointments] = useState([]);
  const [userAppointments, setUserAppointments] = useState([]);
  const [exerciseStartTime, setExerciseStartTime] = useState(null);


  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await SecureStore.getItemAsync('token');
      setIsAuthenticated(!!token);
    };

    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    checkAuthentication();
    getCameraPermissions();
  }, []);

  useEffect(() => {
    if (workoutActive) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [workoutActive]);

  useEffect(() => {
    if (timerId) {
      const intervalId = setInterval(() => {
        const now = new Date();
        const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
        if (appointmentEndTime && localNow >= appointmentEndTime) {
          handleEndWorkout();
          clearInterval(intervalId);
        } else if (now.getMinutes() === 55 && now.getSeconds() === 0) {
          Alert.alert("Warning", "You have 5 minutes left to finish your workout.");
        }
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [appointmentEndTime, timerId]);
  
  const fetchAppointmentsData = async () => {
    const token = await SecureStore.getItemAsync('token');
    const userJson = await SecureStore.getItemAsync('user');
    const user = JSON.parse(userJson);
    const userId = user.id;
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    try {
      // Fetch user appointments
      const userAppointmentsResponse = await axios.get(`${API_URL}/Appointments/appointments-with-machines-for-user/${userId}`, config);
      setUserAppointments(userAppointmentsResponse.data);

      // Fetch all appointments
      const appointmentsResponse = await axios.get(`${API_URL}/Appointments`, config);
      setAllAppointments(appointmentsResponse.data);

      return true;
    } catch (error) {
      console.error("Error fetching appointments data:", error);
      return false;
    }
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    const exerciseData = JSON.parse(data);
    let formattedExercise = {};
    const now = new Date();
    const currentHour = now.getHours();

    const todayAppointments = allAppointments.find(app => new Date(app.date).toDateString() === now.toDateString());
  
    if (todayAppointments) {
      const currentHourAvailability = todayAppointments.hourlyAvailability.find(hour => hour.hour === currentHour);

      if (currentHourAvailability) {
        const machineAvailability = currentHourAvailability.machineAvailabilities.find(machine => machine.machineName === exerciseData.name);
  
        if (machineAvailability) {
          const userHasReservation = userAppointments.some(app => 
            new Date(app.date).getHours() === currentHour &&
            app.machines.some(machine => machine.machineName === exerciseData.name)
          );
          const hasAvailableSlot = machineAvailability.slotCount > 0;
  
          if (userHasReservation || hasAvailableSlot) {
              formattedExercise = {
                exercise: exerciseData.name,
                type: exerciseData.type,
            }
            setExerciseStartTime(timer);
            setCurrentExercise(formattedExercise);
            setScanned(true);
            setShowScanner(false);
            setScannerModalVisible(false);
            if (!workoutActive) setWorkoutActive(true);
          } else {
            Alert.alert("Machine Unavailable", "This machine is not reserved by you and has no available slots.");
            setScanned(false);
            setShowScanner(false);
            setScannerModalVisible(false);
            return;
          }
        } else {
          Alert.alert("Machine Not Found", "This machine is not available in the current hour.");
        }
      } else {
        Alert.alert("No Availability", "There is no availability information for the current hour.");
      }
    } else {
      Alert.alert("No Appointments", "There are no appointments for today.");
    }
  };
  
  

  const startTimer = () => {
    if (!timerId) {
      const id = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      setTimerId(id);
    }
  };

  const stopTimer = () => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
  };

  const handleEndExercise = async () => {
    const duration = timer - exerciseStartTime;
    const token = await SecureStore.getItemAsync('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    try {
      let response;
      if (currentExercise.type === "strength") {
        response = await axios.post(`${API_URL}/Workouts/GenerateStrengthExerciseData`, {
          exerciseName: currentExercise.exercise,
          duration: duration
        }, config);
      } else if (currentExercise.type === "cardio") {
        response = await axios.post(`${API_URL}/Workouts/GenerateCardioExerciseData`, {
          exerciseName: currentExercise.exercise,
          duration: duration
        }, config);
      }
      const generatedExerciseData = response.data;

      setWorkoutData(prevWorkoutData => [...prevWorkoutData, generatedExerciseData]);
      setShowExerciseData(true);
      setCurrentExercise(null);
      setScanned(false);
      setExerciseStartTime(null);
    } catch (error) {
      console.error("Error generating exercise data:", error);
      Alert.alert("Error", "An error occurred while generating exercise data.");
    }
  };

  const handleEndWorkout = async () => {
    const token = await SecureStore.getItemAsync('token');
    const userJson = await SecureStore.getItemAsync('user');
    const user = JSON.parse(userJson);
    const userId = user.id;
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    const details = workoutData.flatMap(ex => {
      if (ex.type === "Strength" && Array.isArray(ex.repsPerSet) && Array.isArray(ex.weightPerSet)) {
          return ex.repsPerSet.map((rep, index) => ({
              name: ex.exercise,
              reps: rep,
              weight: ex.weightPerSet[index],
              distance: 0,
              avgSpeed: 0,
              maxSpeed: 0,
              caloriesBurned: 0,
              time: 0
          }));
      } else if (ex.type === "Cardio") {
          return [{
              name: ex.exercise,
              reps: 0,
              weight: 0,
              distance: ex.distance || 0,
              avgSpeed: ex.avg_speed || 0,
              maxSpeed: ex.max_speed || 0,
              caloriesBurned: ex.calories || 0,
              time: ex.time || 0
          }];
      } else {
          return [];
      }
  });

    axios.post(`${API_URL}/Workouts`, {
      userId: userId,
      durationInSeconds: timer,
      details: details
    }, config).then(response => {
      console.log("Data successfully sent to backend:", response);
      setWorkoutData([]);
      setTimer(0);
      setShowExerciseData(false);
      setWorkoutActive(false);
      setAppointmentEndTime(null);
      publish('competitionModified'); 
    }).catch(error => {
      console.log(details);
      console.error("Failed to send data to backend:", error);
    });
  };

  const openScanner = () => {
    setScannerModalVisible(true);
    setShowScanner(true);
  };

  const canStartWorkout = async () => {
    fetchAppointmentsData();
    const token = await SecureStore.getItemAsync('token');
    const userJson = await SecureStore.getItemAsync('user');
    const user = JSON.parse(userJson);
    const userId = user.id;
    const now = new Date();
    console.log("Date:", now);
    const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    const roundedTime = new Date(localNow.getFullYear(), localNow.getMonth(), localNow.getDate(), localNow.getHours());;
    console.log("Rounded Time:", roundedTime);
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await axios.post(`${API_URL}/Appointments/checkAppointment`, {
        UserId: userId,
        Date: roundedTime
      }, config);
      
      if (response.data) {
        console.log(now.getMinutes());
        if (now.getMinutes() <= 59) {
          const endTime = roundedTime;
          endTime.setMinutes(0);
          endTime.setSeconds(0);
          endTime.setMilliseconds(0);
          endTime.setHours(endTime.getHours() + 1);
          setAppointmentEndTime(endTime);
          openScanner();
        } else {
          Alert.alert("Cannot start workout", "You can only start a workout within 40 minutes of your appointment time.");
        }
      } else {
        Alert.alert("No Appointment", "You do not have an appointment at this time.");
      }
    } catch (error) {
      console.error("Error checking appointment:", error);
      Alert.alert("Error", "An error occurred while checking your appointment.");
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {!workoutActive ?
        <TouchableOpacity style={styles.button} onPress={canStartWorkout}>
          <Text style={styles.buttonText}>Start Workout</Text>
        </TouchableOpacity>
        :
        <>
          {currentExercise ?
            <>
              <TouchableOpacity style={styles.button} onPress={handleEndExercise}>
                <Text style={styles.buttonText}>End Exercise</Text>
              </TouchableOpacity>
            </>
            :
            <TouchableOpacity style={styles.button} onPress={openScanner} disabled={new Date().getMinutes() >= 55}>
              <Text style={styles.buttonText}>Start New Exercise</Text>
            </TouchableOpacity>
          }
        </>
      }
      {workoutActive && <Text style={styles.timerText}>Timer: {timer} seconds</Text>}
      {currentExercise && (
        <>
          <Text style={styles.exerciseText}>
            Exercise started: {currentExercise.exercise}
          </Text>
          <View style={styles.exerciseContainer}>
            <Image 
              source={exerciseImages[currentExercise.exercise]} 
              style={styles.exerciseImage} 
              resizeMode="contain"
            />
          </View>
        </>
      )}
      {showExerciseData && workoutData.length > 0 && (
        <ScrollView style={styles.dataDisplay}>
          {workoutData.map((exercise, index) => (
            <View key={index} style={styles.exerciseContainer}>
              <Text style={styles.exerciseTitle}>{exercise.exercise}</Text>
              {exercise.type === "Strength" && exercise.repsPerSet.map((rep, setIndex) => (
                <View key={setIndex} style={styles.setRow}>
                  <Text>Set {setIndex + 1}</Text>
                  <Text>{rep} reps</Text>
                  <Text>{exercise.weightPerSet[setIndex]} kgs</Text>
                </View>
              ))}
              {exercise.type === "Cardio" && (
                <View>
                  <Text>Distance: {exercise.distance} km</Text>
                  <Text>Average Speed: {exercise.avgSpeed} km/h</Text>
                  <Text>Max Speed: {exercise.maxSpeed} km/h</Text>
                  <Text>Calories Burned: {exercise.calories} kcal</Text>
                  <Text>Time: {exercise.time} minutes</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
      {scanned && !currentExercise &&
        <TouchableOpacity style={styles.button} onPress={handleEndExercise}>
          <Text style={styles.buttonText}>End Exercise</Text>
        </TouchableOpacity>
      }
      {workoutData.length > 0 && (
        <TouchableOpacity style={styles.button} onPress={handleEndWorkout}>
          <Text style={styles.buttonText}>End Workout</Text>
        </TouchableOpacity>
      )}
      <Modal
        animationType="slide"
        transparent={false}
        visible={scannerModalVisible}
        onRequestClose={() => {
          setScannerModalVisible(false);
          setShowScanner(false);
        }}
      >
        <View style={styles.modalView}>
          <View style={styles.cameraBox}>
            {showScanner && (
              <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr", "pdf417"],
                }}
                style={StyleSheet.absoluteFillObject}
              />
            )}
          </View>
          <TouchableOpacity style={styles.button} onPress={() => {
            setScannerModalVisible(false);
            setShowScanner(false);
          }}>
            <Text style={styles.buttonText}>Close Scanner</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default WorkoutsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff'
  },
  cameraBox: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cccccc'
  },
  dataDisplay: {
    marginTop: 20
  },
  exerciseContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    backgroundColor: '#e8e8e8',
    padding: 5,
    borderRadius: 5
  },
  timerText: {
    fontSize: 16,
    color: '#1e90ff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  exerciseText: {
    fontSize: 16,
    color: '#32cd32',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#1e90ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold'
  },
  exerciseImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10
  }
});
