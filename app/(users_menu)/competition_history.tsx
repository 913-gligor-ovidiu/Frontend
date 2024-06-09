import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

const mockData = [
  {
    id: '1',
    name: 'Spring Marathon',
    startDate: '2023-03-01',
    endDate: '2023-03-31',
    competitionType: 'Running',
    description: 'A month-long running competition',
    machines: ['Treadmill'],
    userPoints: 1500,
    finalRank: 1,
  },
  {
    id: '2',
    name: 'Winter Lift-off',
    startDate: '2022-12-01',
    endDate: '2023-02-29',
    competitionType: 'Weightlifting',
    description: 'A strength competition for lifting',
    machines: ['Bench Press', 'Leg press'],
    userPoints: 1200,
    finalRank: 4,
  },
];

const CompetitionHistory = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCompetitions(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#03A9F4" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {competitions.map((competition) => (
        <View key={competition.id} style={styles.card}>
          <Text style={styles.title}>{competition.name}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Start Date:</Text>
            <Text style={styles.details}>{new Date(competition.startDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>End Date:</Text>
            <Text style={styles.details}>{new Date(competition.endDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.details}>{competition.competitionType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.details}>{competition.description}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Machines:</Text>
            <Text style={styles.details}>{competition.machines.join(', ')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Your Points:</Text>
            <Text style={styles.details}>{competition.userPoints}</Text>
          </View>
          <Text style={styles.rank}>{`Rank: ${competition.finalRank}`}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 8,
    borderLeftColor: '#03A9F4', 
    position: 'relative'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    width: 120, 
  },
  details: {
    fontSize: 16,
    color: '#666',
    flexShrink: 1, 
  },
  rank: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#03A9F4' 
  }
});

export default CompetitionHistory;
