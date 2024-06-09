import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, FlatList, Pressable, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '../../constants';

const CompetitionDetails = () => {
    const param = useLocalSearchParams();
    const competitionid = param['id'];
    const [competition, setCompetition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCompetitionDetails = async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (!token) {
                Alert.alert("Error", "No token found, please login again.");
                return;
            }
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };
            const response = await axios.get(`${API_URL}/Competitions/competition-with-users/${competitionid}`, config);
            const competitionDetails = response.data;
            setCompetition(competitionDetails);
        } catch (error) {
            console.error('Failed to fetch competition details:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId) => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (!token) {
                Alert.alert("Error", "No token found, please login again.");
                return;
            }
            await axios.delete(`${API_URL}/Competitions/remove-user/${competitionid}/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            Alert.alert("Success", "User removed successfully.");
            fetchCompetitionDetails(); 
        } catch (error) {
            console.error('Failed to remove user:', error);
            Alert.alert("Error", "Failed to remove user: " + (error.response?.data || "Unknown error"));
        }
    };

    useEffect(() => {
        fetchCompetitionDetails();
    }, [competitionid]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text>Error: {error}</Text>
            </View>
        );
    }

    if (!competition) {
        return (
            <View style={styles.center}>
                <Text>No competition data available.</Text>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <View style={styles.leaderboardEntry}>
            <Pressable
                style={styles.entryContent}
                onPress={() => {
                    // Navigate to user details or perform any action
                }}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.score}>{item.points} points   </Text>
            </Pressable>
            <TouchableOpacity onPress={() => deleteUser(item.userId)}>
                <Icon name="trash-bin" size={24} color="#FF3B30"  />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{competition.name}</Text>
            </View>
            <View style={styles.competitionDetails}>
                <View style={styles.card}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Type:</Text>
                        <Text style={styles.detailValue}>{competition.competitionType}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Description:</Text>
                        <Text style={styles.detailValue}>{competition.description}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Machines:</Text>
                        <Text style={styles.detailValue}>{competition.machines.join(', ')}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Start Date:</Text>
                        <Text style={styles.detailValue}>{new Date(competition.startDate).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>End Date:</Text>
                        <Text style={styles.detailValue}>{new Date(competition.endDate).toLocaleDateString()}</Text>
                    </View>
                </View>
            </View>
            <FlatList
                data={competition.users}
                keyExtractor={item => item.userId.toString()}
                renderItem={renderItem}
                style={styles.leaderboard}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    leaderboardEntry: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#DDE2E5',
        borderRadius: 10,
        marginBottom: 10,
    },
    entryContent: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    username: {
        fontSize: 18,
        color: '#4B5563', 
    },
    score: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#9CA3AF', 
    },
    competitionDetails: {
        width: '100%',
        alignItems: 'flex-start',
        marginTop: 20,
    },
    card: {
        width: '100%',
        backgroundColor: '#1F2937', 
        padding: 16,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    detailLabel: {
        fontWeight: 'bold',
        marginRight: 10,
        fontSize: 16,
        color: '#D1D5DB', 
    },
    detailValue: {
        color: '#E5E7EB', 
        fontSize: 16,
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#111827', 
        paddingTop: 30, 
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#1F2937', 
        padding: 10,
        borderRadius: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F3F4F6', 
        flexShrink: 1,
        paddingRight: 10,
    },
    leaderboard: {
        marginTop: 24,
        width: '100%',
        borderRadius: 15,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default CompetitionDetails;
