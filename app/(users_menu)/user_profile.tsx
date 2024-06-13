import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Pressable, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Card, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '../constants';
import { format } from 'date-fns';
import { LineChart } from 'react-native-chart-kit';
import { subscribe } from '../event';

const ProfilePage = () => {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState(null);
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedWorkouts, setExpandedWorkouts] = useState({});

    useEffect(() => {
        fetchUserProfileAndWorkouts();
        const unsubscribe = subscribe('competitionModified', fetchUserProfileAndWorkouts);
        return () => unsubscribe();
    }, []);
    const fetchUserProfileAndWorkouts = async () => {
        const userJson = await SecureStore.getItemAsync('user');
        const user = JSON.parse(userJson);
        const userId = user.id;
        const token = await SecureStore.getItemAsync('token');
        if (userId && token) {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            try {
                const profileResponse = await axios.get(`${API_URL}/Users/profile/${userId}`, config);
                setUserProfile(profileResponse.data);

                const workoutsResponse = await axios.get(`${API_URL}/Workouts/user-workout-history/${userId}`, config);
                setWorkouts(workoutsResponse.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        }
        setLoading(false);
    };
    const logOut = async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
        console.log("Logged out");
        router.replace('/');
    };

    const groupDetailsByName = (details) => {
        return details.reduce((acc, detail) => {
            if (!acc[detail.name]) {
                acc[detail.name] = [];
            }
            acc[detail.name].push(detail);
            return acc;
        }, {});
    };

    const calculateTotalWeight = (details) => {
        return details.reduce((total, detail) => {
            if (detail.reps && detail.weight) {
                return total + (detail.reps * detail.weight);
            }
            return total;
        }, 0);
    };

    const prepareChartData = (workouts) => {
        const exerciseData = {};
        workouts.forEach((workout) => {
            workout.details.forEach((detail) => {
                if (!exerciseData[detail.name]) {
                    exerciseData[detail.name] = {};
                }
                const date = format(new Date(workout.date), 'dd/MM');
                if (!exerciseData[detail.name][date]) {
                    exerciseData[detail.name][date] = 0;
                }
                if (detail.reps && detail.weight) {
                    exerciseData[detail.name][date] += detail.reps * detail.weight;
                }
                if (detail.distance) {
                    exerciseData[detail.name][date] += detail.distance;
                }
            });
        });
        return exerciseData;
    };
    

    const renderWorkoutDetail = (groupedDetails) => {
        return Object.keys(groupedDetails).map((name, index) => (
            <View key={name + index} style={styles.detailGroupContainer}>
                <Text style={styles.workoutDetailHeader}>{name}</Text>
                <Text>Duration: {groupedDetails[name][0]['time']} seconds</Text>
                {groupedDetails[name].map((detail, detailIndex) => (
                    <View key={`${name}-${detailIndex}`} style={styles.detailContainer}>
                        {detail.reps && <Text style={styles.workoutDetail}>Reps: {detail.reps}</Text>}
                        {detail.weight && <Text style={styles.workoutDetail}>Weight: {detail.weight} kgs</Text>}
                        {detail.distance && <Text style={styles.workoutDetail}>Distance: {detail.distance} km</Text>}
                        {detail.avgSpeed && <Text style={styles.workoutDetail}>Avg Speed: {detail.avgSpeed} km/h</Text>}
                        {detail.maxSpeed && <Text style={styles.workoutDetail}>Max Speed: {detail.maxSpeed} km/h</Text>}
                        {detail.caloriesBurned && <Text style={styles.workoutDetail}>Calories Burned: {detail.caloriesBurned}</Text>}
                        <Text style={styles.workoutDetail}>Points: {detail.points}</Text>
                    </View>
                ))}
            </View>
        ));
    };

    const renderChart = (exerciseData) => {
        return Object.keys(exerciseData).map((exercise, index) => {
            const dates = Object.keys(exerciseData[exercise]);
            const weights = dates.map((date) => exerciseData[exercise][date]);
            const yAxisSuffix = exercise === 'TreadMill' ? ' km' : ' kg';
            return (
                <View key={`chart-${exercise}`} style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>{exercise}</Text>
                    <ScrollView horizontal>
                        <LineChart
                            data={{
                                labels: dates,
                                datasets: [{ data: weights }]
                            }}
                            width={Dimensions.get('window').width}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix ={yAxisSuffix}
                            yAxisInterval={1} 
                            chartConfig={{
                                backgroundColor: '#ffffff',
                                backgroundGradientFrom: '#ffffff',
                                backgroundGradientTo: '#ffffff',
                                decimalPlaces: 0, 
                                color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: {
                                    borderRadius: 16,
                                },
                                propsForDots: {
                                    r: "6",
                                    strokeWidth: "2",
                                    stroke: "#0000ff",
                                },
                                propsForLabels: {
                                    fontSize: 12,
                                },
                            }}
                            style={{
                                marginVertical: 8,
                                borderRadius: 16,
                                paddingRight: 100, // Ensure the y-axis labels are fully visible
                            }}
                        />
                    </ScrollView>
                </View>
            );
        });
    };
    
    

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    const toggleWorkoutDetails = (index) => { setExpandedWorkouts((prev) => ({ ...prev, [index]: !prev[index] })); };
    const exerciseData = prepareChartData(workouts);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {userProfile ? (
                    <Card style={styles.card}>
                        <Card.Title title={userProfile.username} left={(props) => <Avatar.Icon {...props} icon="account" />} />
                        <Card.Content>
                            <View style={styles.profileRow}>
                                <View style={styles.profileItem}>
                                    <Text style={styles.label}>Name:</Text>
                                    <Text style={styles.value}>{userProfile.firstName} {userProfile.lastName}</Text>
                                </View>
                                <View style={styles.profileItem}>
                                    <Text style={styles.label}>Age:</Text>
                                    <Text style={styles.value}>{userProfile.age}</Text>
                                </View>
                            </View>
                            <View style={styles.profileRow}>
                                <View style={styles.profileItem}>
                                    <Text style={styles.label}>Height:</Text>
                                    <Text style={styles.value}>{userProfile.height ? `${userProfile.height} cm` : 'Not specified'}</Text>
                                </View>
                                <View style={styles.profileItem}>
                                    <Text style={styles.label}>Weight:</Text>
                                    <Text style={styles.value}>{userProfile.weight ? `${userProfile.weight} kg` : 'Not specified'}</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                ) : (
                    <Text>No user profile data available.</Text>
                )}
                <Pressable style={styles.button} onPress={logOut}>
                    <Text style={styles.buttonText}>Logout</Text>
                </Pressable>
                {workouts.length > 0 ? (
                    <View style={styles.workoutContainer}>
                        <Text style={styles.workoutTitle}>Workout History</Text>
                        {workouts.map((workout, workoutIndex) => (
                            <Card key={`workout-${workoutIndex}`} style={styles.workoutCard}>
                                <Pressable onPress={() => toggleWorkoutDetails(workoutIndex)}>
                                    <Card.Content>
                                        <View style={styles.workoutHeader}>
                                            <Text style={styles.workoutDate}>{format(new Date(workout.date), 'PPP')}</Text>
                                            <Text style={styles.workoutDuration}>Duration: {workout.durationInSeconds} seconds</Text>
                                        </View>
                                        <Text style={styles.workoutDetailHeader}>Points: {workout.points}</Text>
                                    </Card.Content>
                                </Pressable>
                                {expandedWorkouts[workoutIndex] && (
                                    <Card.Content>
                                        {renderWorkoutDetail(groupDetailsByName(workout.details))}
                                    </Card.Content>
                                )}
                            </Card>
                        ))}
                        <View style={styles.chartSection}>
                            <Text style={styles.chartSectionTitle}>Exercise Charts</Text>
                            {renderChart(exerciseData)}
                        </View>
                    </View>
                ) : (
                    <Text>No workout history available.</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    scrollViewContent: {
        padding: 20,
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '100%',
        padding: 10,
        backgroundColor: 'white',
        marginBottom: 20,
        elevation: 4,
    },
    profileRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    profileItem: {
        flex: 1,
        marginRight: 10,
    },
    workoutContainer: {
        width: '100%',
    },
    workoutTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    workoutCard: {
        marginBottom: 10,
        padding: 10,
    },
    workoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    workoutDate: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    workoutDuration: {
        fontSize: 14,
        color: '#666',
    },
    workoutDetailHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 10,
    },
    workoutDetail: {
        fontSize: 14,
        color: '#666',
    },
    detailGroupContainer: {
        marginBottom: 10,
    },
    detailContainer: {
        marginBottom: 5,
        padding: 5,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
    label: {
        fontWeight: 'bold',
        color: '#333',
        fontSize: 16,
    },
    value: {
        fontSize: 16,
        color: '#666'
    },
    button: {
        backgroundColor: '#1e90ff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    chartContainer: {
        marginVertical: 20,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    chartSection: {
        width: '100%',
    },
    chartSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
});

export default ProfilePage;
