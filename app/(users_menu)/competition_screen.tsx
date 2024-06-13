import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, Pressable } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants';
import { subscribe } from '../event';
import { useRouter } from 'expo-router';

const CompetitionsScreen = () => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentCompetition, setCurrentCompetition] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchCompetitionForUser();
    const unsubscribe = subscribe('competitionModified', fetchCompetitionForUser);
    return () => unsubscribe();
  }, []);

  const fetchCompetitionForUser = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userJson = await SecureStore.getItemAsync('user');
      const user = JSON.parse(userJson);
      const userId = user.id;
      setCurrentUserId(userId);
      if (!token || !userId) {
        Alert.alert("Error", "Login session expired, please login again.");
        return;
      }
      const response = await axios.get(`${API_URL}/Competitions/competition-for-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const competitionData = response.data;
      if (competitionData && competitionData.users) {
        competitionData.users.sort((a, b) => b.points - a.points);
      }

      console.log('Fetched competition:', competitionData);
      setCurrentCompetition(competitionData);
      setIsEnrolled(true);
    } catch (error) {
      console.error('Failed to fetch competition:', error);
      setIsEnrolled(false);
      setCurrentCompetition(null);
      if (error.response && error.response.status === 404) {
        console.log('User is not enrolled in any competition');
      }
    }
  };

  const joinCompetition = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userJson = await SecureStore.getItemAsync('user');
      const user = JSON.parse(userJson);
      const userId = user.id;
      if (!token || !userId) {
        Alert.alert("Error", "Login session expired, please login again.");
        return;
      }
      const response = await axios.post(`${API_URL}/Competitions/enroll`, {
        UserId: userId,
        CompetitionCode: code
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert("Success", "Joined competition successfully!");
      fetchCompetitionForUser(); 
    } catch (error) {
      console.error('Failed to join competition:', error);
      Alert.alert("Error", "Failed to join competition: " + (error.response.data || "Unknown error"));
    }
  };

  const unenrollCompetition = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert("Error", "Session expired, please login again.");
        return;
      }
      const response = await axios.delete(`${API_URL}/Competitions/unenroll/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert("Success", "You have successfully unenrolled from the competition.");
      setIsEnrolled(false);
      setCurrentCompetition(null);
      fetchCompetitionForUser(); 
    } catch (error) {
      console.error('Failed to unenroll from competition:', error);
      Alert.alert("Error", "Failed to unenroll from competition: " + (error.response?.data || "Unknown error"));
    }
  };

  const renderItem = ({ item, index }) => (
    <Pressable
      style={item.userId === currentUserId ? styles.highlightedLeaderboardEntry : styles.leaderboardEntry}
      onPress={() => {
        router.navigate(`(users_menu)/${item.userId}`)
      }}>
      <Text style={styles.position}>{index + 1}.</Text>
      <Text style={styles.username}>{item.username}</Text>
      <Text style={styles.score}>{item.points} points</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {isEnrolled && currentCompetition ? (
        <>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{currentCompetition.name}</Text>
            <Pressable style={styles.exitButton} onPress={unenrollCompetition}>
              <Text style={styles.exitButtonText}>Exit</Text>
            </Pressable>
          </View>
          <Text style={styles.endDateText}>
              Ends On: <Text style={styles.endDateValue}>{new Date(currentCompetition.endDate).toLocaleDateString()}</Text>
          </Text>
          <View style={styles.competitionDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>{currentCompetition.competitionType}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Description:</Text>
              <Text style={styles.detailValue}>{currentCompetition.description}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Machines:</Text>
              <Text style={styles.detailValue}>{currentCompetition.machines.join(', ')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Start Date:</Text>
              <Text style={styles.detailValue}>{new Date(currentCompetition.startDate).toLocaleDateString()}</Text>
            </View>
          </View>
          <FlatList
            data={currentCompetition.users}
            keyExtractor={item => item.userId.toString()}
            renderItem={renderItem}
            style={styles.leaderboard}
          />
        </>
      ) : (
        <View style={styles.nonEnrolledContainer}>
          <Text style={styles.nonEnrolledText}>
            Competition is always good because it can motivate you to achieve your goals.
            Seems that for now, you are not competing with anyone.
          </Text>
          <Text style={styles.prompt}>
            You can join a competition with a code below:
          </Text>
          <TextInput
            style={styles.input}
            onChangeText={setCode}
            value={code}
            placeholder="Enter Competition Code"
            placeholderTextColor="#888"
          />
          <Button title="Join Competition" onPress={joinCompetition} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  leaderboardEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDE2E5',
    alignItems: 'flex-start',
  },
  highlightedLeaderboardEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E3FCEF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDE2E5',
    alignItems:'flex-start' ,
  },
  position: {
    fontWeight: 'bold',
  },
  username: {
    fontSize: 18,
    color: '#102A43',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D9534F',
  },
  nonEnrolledContainer: {
    width: '100%',
  },
  nonEnrolledText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#334E68',
    marginBottom: 20,
  },
  prompt: {
    fontSize: 18,
    textAlign: 'center',
    color: '#102A43',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: '#CBD2D9',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
    borderRadius: 5,
    color: '#334E68',
  },
  joinCompetition: {
    width: '100%',
    alignItems: 'center',
  },
  competitionDetails: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: 20,
    backgroundColor: '#FFF',
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
    color: '#102A43',
  },
  detailValue: {
    color: '#334E68',
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F4F8',
    paddingTop: 30, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#102A43',
    flexShrink: 1,
    paddingRight: 10,
  },
  dateText: {
    fontSize: 20,
    color: '#334E68',
    marginBottom: 8,
  },
  leaderboard: {
    marginTop: 24,
    width: '100%',
  },
  exitButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  exitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  endDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black', 
    marginBottom: 20,
    textAlign: 'justify',
  },
  endDateValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'blue', 
  },  
});

export default CompetitionsScreen;
