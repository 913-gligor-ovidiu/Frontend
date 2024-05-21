import { Link, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '../constants';
import { subscribe } from '../event';

const ManageCompetitions = () => {
    const router = useRouter();
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCompetitions = async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (!token) {
                Alert.alert("Error", "No token found, please login again.");
                return;
            }
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };
            const allCompetitionsResponse = await axios.get(`${API_URL}/Competitions/competitions-with-users`, config);
            const allCompetitions = allCompetitionsResponse.data;
            console.log('All Competitions:', JSON.stringify(allCompetitions, null, 2));

            setCompetitions(allCompetitions.map(comp => ({
                ...comp,
                participants: comp.users ? comp.users.sort((a, b) => b.points - a.points) : []
            })));
        } catch (error) {
            console.error('Failed to fetch competitions:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompetitions();
        const unsubscribe = subscribe('competitionCreated', fetchCompetitions);
        return () => unsubscribe();
    }, []);


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

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {competitions.map((competition) => (
                    <View key={competition.id} style={styles.card}>
                        <Text style={styles.title}>{competition.name}</Text>
                        <Text style={styles.details}>{`Code: ${competition.code}`}</Text>
                        <Text style={styles.details}>{`Start Date: ${new Date(competition.startDate).toLocaleDateString()}`}</Text>
                        <Text style={styles.details}>{`End Date: ${new Date(competition.endDate).toLocaleDateString()}`}</Text>
                        <Text style={styles.details}>{`Type: ${competition.competitionType}`}</Text>
                        <Text style={styles.details}>{`Description: ${competition.description}`}</Text>
                        <Text style={styles.details}>{`Machines: ${competition.machines}`}</Text>
                        {competition.participants.length > 0 ? (
                            competition.participants.map((participant, index) => (
                                <Text key={index} style={styles.participant}>{participant.username} - Points: {participant.points}</Text>
                            ))
                        ) : (
                            <Text style={styles.noParticipants}>No participants yet.</Text>
                        )}
                    </View>
                ))}
            </ScrollView>
            <TouchableOpacity
                style={styles.fab}
                onPress={() => { router.push('create_competition'); }}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9'
    },
    scrollView: {
        flex: 1
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333'
    },
    details: {
        fontSize: 16,
        marginBottom: 4,
        color: '#666'
    },
    participant: {
        fontSize: 14,
        marginTop: 2,
        marginLeft: 10,
        color: '#444'
    },
    noParticipants: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#888'
    },
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 25,
        bottom: 25,
        backgroundColor: '#03A9F4',
        borderRadius: 30,
        elevation: 12
    },
    fabIcon: {
        fontSize: 26,
        color: 'white'
    }
});

export default ManageCompetitions;
