// routes/userProfileModal.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants';
import { useLocalSearchParams } from 'expo-router';
import { Avatar, Card } from 'react-native-paper';

export default function UserProfileModal() {
  const  param  =  useLocalSearchParams();
  const userId = param.id;
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = await SecureStore.getItemAsync('token');
      console.log('Fetching user profile for user ID:', userId);
      if (userId && token) {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        try {
          const response = await axios.get(`${API_URL}/Users/profile/${userId}`, config);
          console.log('Fetched user profile:', response.data);
          setUserProfile(response.data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (!userProfile) {
    return <View><Text>No user profile data available.</Text></View>;
  }

  return (
    <View style={styles.container}>
            {userProfile ? (
                <Card style={styles.card}>
                    <Card.Title title={userProfile.username} left={(props) => <Avatar.Icon {...props} icon="account" />} />
                    <Card.Content>
                        <Text style={styles.label}>Name:</Text>
                        <Text style={styles.value}>{userProfile.firstName} {userProfile.lastName}</Text>
                        <Text style={styles.label}>Age:</Text>
                        <Text style={styles.value}>{userProfile.age}</Text>
                        <Text style={styles.label}>Height:</Text>
                        <Text style={styles.value}>{userProfile.height ? `${userProfile.height} cm` : 'Not specified'}</Text>
                        <Text style={styles.label}>Weight:</Text>
                        <Text style={styles.value}>{userProfile.weight ? `${userProfile.weight} kg` : 'Not specified'}</Text>
                        <Text style={styles.label}>Sex:</Text>
                        <Text style={styles.value}>{userProfile.sex}</Text>
                    </Card.Content>
                </Card>
            ) : (
                <Text>No user profile data available.</Text>
            )}
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f6f6f6'
},
card: {
    width: '100%',
    padding: 10,
    backgroundColor: 'white',
    marginBottom: 20,
    elevation: 4,
},
label: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
    marginTop: 5
},
value: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666'
},
});
